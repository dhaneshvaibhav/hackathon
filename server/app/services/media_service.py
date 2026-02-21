import cloudinary
import cloudinary.uploader
from flask import current_app

class MediaService:
    @staticmethod
    def configure():
        cloudinary.config(
            cloud_name=current_app.config.get('CLOUDINARY_CLOUD_NAME'),
            api_key=current_app.config.get('CLOUDINARY_API_KEY'),
            api_secret=current_app.config.get('CLOUDINARY_API_SECRET')
        )

    @staticmethod
    def upload_file(file, folder="hackathon_uploads"):
        """
        Uploads a file to Cloudinary.
        
        Args:
            file: The file object from request.files
            folder: The folder in Cloudinary to upload to
            
        Returns:
            dict: The result from Cloudinary including 'secure_url'
            str: Error message if any
        """
        MediaService.configure()
        
        try:
            if not current_app.config.get('CLOUDINARY_CLOUD_NAME'):
                return None, "Cloudinary not configured"

            upload_result = cloudinary.uploader.upload(
                file,
                folder=folder,
                resource_type="auto"
            )
            return upload_result, None
        except Exception as e:
            return None, str(e)
