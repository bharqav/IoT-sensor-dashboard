import './globals.css';

export const metadata = {
    title: 'IoT Sensor Dashboard',
    description: 'Real-time sensor data monitoring dashboard',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
