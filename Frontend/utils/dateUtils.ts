
import { format, formatDistanceToNow, isPast } from 'date-fns';

export const formatInterviewDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, MMM d, yyyy h:mm a');
};

export const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();

    if (diffTime < 0) return { text: 'Past', color: 'text-gray-500', variant: 'secondary' };

    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
        return { text: `${days}d ${hours}h`, color: 'text-slate-700', variant: 'outline' };
    } else if (hours > 0) {
        return { text: `${hours}h ${minutes}m`, color: 'text-amber-600', variant: 'warning' };
    } else {
        return { text: `${minutes}m`, color: 'text-red-600', variant: 'destructive' };
    }
};
