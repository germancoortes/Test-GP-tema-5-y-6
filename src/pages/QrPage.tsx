import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../components/common/Button';

export function QrPage() {
  const siteUrl =
    (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined) ||
    window.location.origin;

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-teal-50 px-4 py-10 print:bg-white print:px-0 print:py-0">
      <div className="no-print flex flex-col items-center gap-2 text-center">
        <h1 className="font-display text-2xl font-bold text-navy-900">
          Cartel QR para imprimir
        </h1>
        <p className="max-w-md text-navy-900/70">
          Tamaño A5, listo para plastificar y colocar en la piscina. Pulsa
          "Imprimir" y elige tamaño de papel A5 (o A4 y recorta).
        </p>
        <p className="max-w-md break-all text-sm text-navy-900/50">
          {siteUrl}
        </p>
        <Button onClick={() => window.print()}>🖨️ Imprimir cartel</Button>
      </div>

      <div className="print-a5 mx-auto box-border flex flex-col items-center justify-center gap-4 rounded-3xl border-4 border-navy-900 bg-white p-5 shadow-lg sm:gap-8 sm:p-10 print:rounded-none print:border-0 print:shadow-none">
        <p className="text-center font-display text-lg font-extrabold uppercase tracking-wide text-teal-600 sm:text-2xl">
          ¡Reserva tu clase de natación!
        </p>

        <div className="rounded-2xl border-4 border-navy-900 bg-white p-3 sm:p-4">
          <QRCodeSVG
            value={siteUrl}
            size={200}
            level="H"
            fgColor="#073B4C"
            bgColor="#FFFFFF"
            className="h-auto w-full max-w-[280px]"
          />
        </div>

        <p className="text-center text-sm text-navy-900 sm:text-base">
          Escanea este código con la cámara de tu móvil
        </p>

        <div className="text-center">
          <p className="font-display text-lg font-bold text-navy-900 sm:text-xl">
            🏊 Escuela de Natación
          </p>
          <p className="font-display text-base font-bold text-sun-600 sm:text-lg">
            La Loma de Santi Petri
          </p>
          <p className="mt-1 text-xs text-navy-900/70 sm:text-sm">
            Chiclana de la Frontera · Instructores German y Ainoa
          </p>
        </div>
      </div>
    </div>
  );
}
