import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..services.connection_manager import ws_manager

logger = logging.getLogger("skein.ws_router")
router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws/live")
async def websocket_live_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    # Send initial welcome state
    await websocket.send_json({
        "type": "connection_established",
        "message": "Connected to Skein Live Financial Crime Stream",
        "timestamp": ""
    })
    try:
        while True:
            # Keep connection open and accept any client commands if sent
            data = await websocket.receive_text()
            # client can ping
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket connection error: {e}")
        ws_manager.disconnect(websocket)
