def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert data["database"] == "healthy"
    assert "version" in data
    assert data["ocr_engine"] == "paddleocr-cpu"
