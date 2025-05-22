from fastapi import HTTPException, status
from supabase import create_client, Client
import mimetypes
from app.core.config import settings
from app.models.user import User

class SupabaseStorageService:
    @staticmethod
    def upload_file(
        file_content: bytes, 
        file_path: str, 
        content_type: str
    ) -> str:
        """Upload file to Supabase Storage with user authentication"""
        try:
            # Initialiser le client avec le JWT de l'utilisateur
            supabase: Client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_KEY
            )
            
            if not content_type:
                content_type = mimetypes.guess_type(file_path)[0] or 'application/octet-stream'
            
            # Upload avec vérification du propriétaire
            res = supabase.storage.from_(settings.SUPABASE_BUCKET_NAME).upload(
                path=file_path,
                file=file_content,
                file_options={
                    "content-type": content_type,
                    "cache-control": "3600",
                    "upsert": "true"
                }
            )
            
            if not res:
                raise Exception("Upload failed with no error message")
                
            return supabase.storage.from_(settings.SUPABASE_BUCKET_NAME).get_public_url(file_path)
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN if "permission denied" in str(e).lower() 
                else status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"File upload failed: {str(e)}"
            )