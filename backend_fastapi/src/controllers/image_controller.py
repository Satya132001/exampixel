import os
import logging
import base64
from ..config import db
from ..models import ai_processor
from ..utils import image_utils
from fastapi.responses import JSONResponse

logger = logging.getLogger("backend_fastapi.image_controller")


async def process_image(body: dict):
    try:
        image_b64 = body.get('image')
        exam_name = body.get('exam_name')
        process_type = body.get('process_type', 'basic')
        photo_type = body.get('photo_type', 'photo')

        if not image_b64:
            return JSONResponse({"success": False, "message": "image (base64) is required"}, status_code=400)

        # Decode image
        img = image_utils.decode_base64_image(image_b64)

        if process_type == 'basic':
            processed_b64, info = image_utils.resize_and_compress(img, exam_name, photo_type)
        elif process_type == 'hd_enhance':
            enhanced = ai_processor.hd_enhance(img)
            processed_b64, info = image_utils.resize_and_compress(enhanced, exam_name, photo_type)
        elif process_type == 'bg_remove':
            bg_color = body.get('bg_color', '#ffffff')
            removed = ai_processor.remove_background(img, bg_color)
            processed_b64, info = image_utils.resize_and_compress(removed, exam_name, photo_type)
        elif process_type == 'quality_check':
            qc = ai_processor.quality_check(img)
            return JSONResponse({"success": True, "info": qc})
        else:
            return JSONResponse({"success": False, "message": f"Unknown process_type: {process_type}"}, status_code=400)

        return JSONResponse({"success": True, "processed_image": processed_b64, "info": info})
    except Exception as e:
        logger.exception("Processing failed")
        return JSONResponse({"success": False, "message": str(e)}, status_code=500)


async def save_image(body: dict, user: dict):
    try:
        processed_b64 = body.get('processed_image')
        exam_name = body.get('exam_name')
        photo_type = body.get('photo_type', 'photo')

        if not processed_b64:
            return JSONResponse({"success": False, "message": "processed_image is required"}, status_code=400)

        # use authenticated user's id
        user_id = user.get('id')

        db.execute("INSERT INTO saved_photos (user_id, exam_name, photo_type, image_data) VALUES (%s, %s, %s, %s)", (user_id, exam_name, photo_type, processed_b64))

        return JSONResponse({"success": True, "message": "Image saved"})
    except Exception as e:
        logger.exception("Save image failed")
        return JSONResponse({"success": False, "message": "Server error during save"}, status_code=500)


async def get_history(user_id: int, user: dict):
    try:
        # Authorization: user can only fetch their own history
        if user_id != user.get('id'):
            return JSONResponse({"success": False, "message": "Unauthorized"}, status_code=403)

        query = "SELECT id, exam_name, photo_type, image_data, created_at FROM saved_photos WHERE user_id = %s ORDER BY created_at DESC LIMIT 10"
        rows = db.fetch_all(query, (user_id,))

        images = []
        for r in rows:
            images.append({"id": r[0], "exam_name": r[1], "photo_type": r[2], "image_data": r[3], "created_at": r[4].isoformat()})

        return JSONResponse({"success": True, "images": images})
    except Exception as e:
        logger.exception("Get history failed")
        return JSONResponse({"success": False, "message": "Server error during history"}, status_code=500)
