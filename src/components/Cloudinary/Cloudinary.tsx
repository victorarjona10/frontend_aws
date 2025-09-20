import React, { useState, useRef, useEffect } from 'react';
import { UpdateProfilePicture } from '../../service/userService';
import { UpdateCompanyProfilePicture } from '../../service/companiesService';
import styles from './Cloudinary.module.css';
import Webcam from "react-webcam";
import { putCompanyPhoto } from '../../service/companiesService';

interface CloudinaryProps {
    initialImage?: string;
    userEmail: string;
    model: string;
    onImageUploaded?: (url: string) => void;
}

const Cloudinary: React.FC<CloudinaryProps> = ({ initialImage, userEmail, model, onImageUploaded }) => {
    const presetName = "quickfind";
    const cloudName = "dnt2h1b9z";

    const [image, setImage] = useState<string>(initialImage || '');
    const [loading, setLoading] = useState<boolean>(false);
    const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);

    const cameraInputRef = useRef<Webcam>(null);

        useEffect(() => {
            console.log('initialImage prop:', initialImage);
        setImage(initialImage || '');
    }, [initialImage]);

    const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        if (!e.target.files || e.target.files.length === 0) {
            console.error("Cap fitxer seleccionat");
            return;
        }

        const file = e.target.files[0];
        if (!file.type.startsWith("image/")) {
            console.error("Només s'accepten imatges");
            return;
        }

        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', presetName);

        setLoading(true);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: data,
            });

            const fileData = await response.json();

            if (fileData.secure_url) {
                setImage(fileData.secure_url);
                if (onImageUploaded) {
                    onImageUploaded(fileData.secure_url);
                }
            }
            console.log('Nova imatge pujada:', fileData.secure_url);
            if (model === 'user') {

            await UpdateProfilePicture(userEmail, fileData.secure_url);
            }
            if (model === 'company') {
                await UpdateCompanyProfilePicture(userEmail, fileData.secure_url);
            }
            if (model === 'companyphoto')
            {
                await putCompanyPhoto(userEmail, fileData.secure_url);
            }
        } catch (error) {
            console.error('Error al pujar la imatge:', error);
        } finally {
            setLoading(false);
        }
    };

    const uploadBase64Image = async (base64Image: string): Promise<void> => {
        const data = new FormData();
        data.append('file', base64Image);
        data.append('upload_preset', presetName);

        setLoading(true);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: data,
            });

            const fileData = await response.json();
            setImage(fileData.secure_url);
            console.log('Imatge de càmera pujada:', fileData.secure_url);

            await UpdateProfilePicture(userEmail, fileData.secure_url);
        } catch (error) {
            console.error('Error al pujar la imatge de càmera:', error);
        } finally {
            setLoading(false);
            setIsCameraOpen(false);
        }
    };

    const handleOpenCamera = () => setIsCameraOpen(true);

    const handleCapturePhoto = () => {
        const webcam = cameraInputRef.current;
        const screenshot = webcam?.getScreenshot();
        if (screenshot) {
            setImage(screenshot);
            uploadBase64Image(screenshot);
        } else {
            console.error('No s’ha pogut capturar la foto');
        }
    };

    return (
        <div className={styles['cloudinary-container']}>
            <label htmlFor="file-upload" className={styles['cloudinary-avatar-label']} aria-label="Pujar nova imatge">
                {loading ? (
                    <div className={styles['cloudinary-loading']}>Càrrega...</div>
                ) : (
                    <img
                        src={image || 'https://via.placeholder.com/150'}
                        alt={image ? "Imatge de perfil" : "Avatar per defecte"}
                        className={styles['cloudinary-avatar']}
                    />
                )}
                <input
                    id="file-upload"
                    type="file"
                    className={styles['cloudinary-input']}
                    onChange={uploadImage}
                    accept="image/*"
                />
            </label>

            {!isCameraOpen ? (
                <button onClick={handleOpenCamera} className={styles['cloudinary-button']}>
                    Usar Càmera
                </button>
            ) : (
                <div>
                    <Webcam
                        ref={cameraInputRef}
                        className={styles['webcam-small']}
                        screenshotFormat="image/jpeg"
                        audio={false}
                    />
                    <button onClick={handleCapturePhoto} className={styles['cloudinary-button']}>
                        Capturar Foto
                    </button>
                </div>
            )}
        </div>
    );
};

export default Cloudinary;

