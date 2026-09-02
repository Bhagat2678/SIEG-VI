import io
import os
import logging
from typing import Dict, List, Optional, Tuple, Union, Any

# Ensure mkldnn is disabled for paddle on CPU to avoid primitive execution errors
os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["FLAGS_enable_pir_api"] = "0"
try:
    import paddle
    paddle.set_flags({"FLAGS_use_mkldnn": 0})
except Exception:
    pass

import numpy as np
from PIL import Image
from pydantic import BaseModel, Field

from app.config import settings

logger = logging.getLogger("medikiosk.ocr")


class OCRLine(BaseModel):
    text: str
    confidence: float
    box: Optional[List[Any]] = None


class OCRResult(BaseModel):
    raw_text: str
    lines: List[OCRLine] = Field(default_factory=list)
    average_confidence: float = 0.0
    low_confidence: bool = False
    language: str = "en"


import threading

class OCRService:
    """
    PaddleOCR service wrapper for extracting text from medical prescriptions and lab reports.
    Runs locally on CPU with zero external API key requirements.
    """
    _instance: Optional["OCRService"] = None
    _engine: Optional[Any] = None
    _lock: threading.RLock = threading.RLock()

    @classmethod
    def get_instance(cls) -> "OCRService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _get_engine(self) -> Any:
        with self._lock:
            if self._engine is None:
                try:
                    from paddleocr import PaddleOCR
                    logger.info("Initializing PaddleOCR engine (CPU mode)...")
                    # PP-OCR mobile/default pipeline (CPU robust execution)
                    self._engine = PaddleOCR(
                        use_angle_cls=False,
                        enable_mkldnn=False,
                        lang=settings.OCR_LANG,
                        show_log=False,
                    )
                    logger.info("PaddleOCR engine initialized successfully.")
                except Exception as e:
                    logger.error(f"Failed to initialize PaddleOCR: {e}")
                    self._engine = None
            return self._engine

    def extract_text(
        self,
        image_input: Union[str, bytes, np.ndarray, Image.Image],
    ) -> OCRResult:
        """
        Processes an image and returns extracted lines with confidence scores and full raw text.
        """
        temp_path: Optional[str] = None
        target_path: Optional[str] = None

        if isinstance(image_input, str) and os.path.exists(image_input):
            target_path = image_input
        elif isinstance(image_input, bytes):
            pil_img = Image.open(io.BytesIO(image_input)).convert("RGB")
            import tempfile
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tf:
                temp_path = tf.name
                pil_img.save(temp_path, format="PNG")
            target_path = temp_path
        elif isinstance(image_input, Image.Image):
            import tempfile
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tf:
                temp_path = tf.name
                image_input.convert("RGB").save(temp_path, format="PNG")
            target_path = temp_path
        elif isinstance(image_input, np.ndarray):
            import tempfile
            pil_img = Image.fromarray(image_input).convert("RGB")
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tf:
                temp_path = tf.name
                pil_img.save(temp_path, format="PNG")
            target_path = temp_path
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")

        engine = self._get_engine()
        lines: List[OCRLine] = []
        confidences: List[float] = []

        if engine is not None and target_path is not None:
            results = None
            try:
                with self._lock:
                    results = engine.ocr(target_path)
            except Exception as e:
                logger.warning(f"PaddleOCR primary inference failed ({e}), resetting engine and retrying...")
                with self._lock:
                    self._engine = None
                    engine = self._get_engine()
                    if engine is not None:
                        try:
                            results = engine.ocr(target_path)
                        except Exception as e2:
                            logger.error(f"PaddleOCR retry also failed: {e2}")

            try:
                # Parse PaddleOCR output structure: list of list of [box, (text, score)]
                if results and len(results) > 0:
                    first_res = results[0]
                    if isinstance(first_res, list):
                        for item in first_res:
                            if isinstance(item, (list, tuple)) and len(item) >= 2:
                                box = item[0]
                                text_conf = item[1]
                                if isinstance(text_conf, (list, tuple)) and len(text_conf) >= 2:
                                    text = str(text_conf[0]).strip()
                                    conf = float(text_conf[1])
                                    if text:
                                        lines.append(OCRLine(text=text, confidence=conf, box=box))
                                        confidences.append(conf)
            except Exception as e:
                logger.exception(f"PaddleOCR result parsing error: {e}")
            finally:
                if temp_path and os.path.exists(temp_path):
                    try:
                        os.remove(temp_path)
                    except Exception:
                        pass

        # If OCR returned nothing or failed, try basic heuristic / mock if in testing
        if not lines:
            avg_conf = 0.0
            raw_text = ""
            is_low_conf = True
        else:
            avg_conf = float(np.mean(confidences)) if confidences else 0.0
            raw_text = "\n".join([line.text for line in lines])
            is_low_conf = avg_conf < settings.OCR_CONFIDENCE_THRESHOLD

        return OCRResult(
            raw_text=raw_text,
            lines=lines,
            average_confidence=round(avg_conf, 3),
            low_confidence=is_low_conf,
            language=settings.OCR_LANG,
        )


ocr_service = OCRService.get_instance()
