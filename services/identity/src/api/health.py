from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health")
def health():
    return {"status": "UP"}

@router.get("/ready")
def ready():
    return {"status": "READY"}

@router.get("/live")
def live():
    return {"status": "ALIVE"}
