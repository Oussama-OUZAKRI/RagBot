from fastapi import HTTPException, status
from supabase import create_client, Client
import mimetypes
from pathlib import Path
from app.core.config import settings

# Initialisation du client Supabase
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

class SupabaseStorageService:
    @staticmethod
    def upload_file(file_content: bytes, file_path: str, content_type: str) -> str:
        """Upload file to Supabase Storage"""
        try:
            # Déterminer le type MIME si non spécifié
            if not content_type:
                content_type = mimetypes.guess_type(file_path)[0] or 'application/octet-stream'
            
            # Upload du fichier
            res = supabase.storage.from_(settings.SUPABASE_BUCKET_NAME).upload(
                path=file_path,
                file=file_content,
                file_options={"content-type": content_type}
            )
            
            # Récupérer l'URL publique
            url = supabase.storage.from_(settings.SUPABASE_BUCKET_NAME).get_public_url(file_path)
            return url
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Supabase upload failed: {str(e)}"
            )