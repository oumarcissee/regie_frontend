// Créer un nouvel élément audio
import { truncateText ,notif, formatDate} from '@/services/utils';
const notificationSound = new Audio('/chemin/vers/votre/son.mp3');

// Configuration des options de l'audio
interface NotificationOptions {
    message: string;
    color?: string;
    volume?: number;
    playSound?: boolean;
}

// Fonction de notification améliorée avec son
const showNotification = ({
    message,
    color = 'success',
    volume = 0.5,
    playSound = true
}: NotificationOptions) => {
    // Affichage de la notification
    notif.snackbarMessage = message;
    notif.snackbarColor.value = color;
    notif.snackbar.value = true;
    
    // Jouer le son si activé
    if (playSound) {
        try {
            // Définir le volume
            notificationSound.volume = volume;
            
            // Réinitialiser la position de lecture si le son était déjà en cours
            notificationSound.currentTime = 0;
            
            // Jouer le son
            notificationSound.play().catch(error => {
                console.error('Erreur lors de la lecture du son:', error);
            });
        } catch (error) {
            console.error('Erreur lors de la configuration du son:', error);
        }
    }
};

// Exemple d'utilisation
// Notification avec son par défaut
showNotification({
    message: "Opération réussie !"
});

// Notification avec options personnalisées
showNotification({
    message: "Erreur !",
    color: 'error',
    volume: 0.8,
    playSound: true
});