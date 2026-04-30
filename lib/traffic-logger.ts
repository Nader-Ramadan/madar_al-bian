export async function logMagazineTraffic(
    magazineId: number,
    eventType: 'view' | 'download' | 'share'
) {
    try {
        const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

        const response = await fetch('/api/magazines/traffic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                magazineId,
                eventType,
                userAgent,
            }),
        });

        if (!response.ok) {
            console.error('Failed to log traffic');
        }

        return await response.json();
    } catch (error) {
        console.error('Error logging traffic:', error);
    }
}
