

"use client";

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Printer, Download, Send } from "lucide-react";
import { cn } from '@/lib/utils';
import { PosLogo } from '@/components/ui/pos-logo';
import { SaleDataForTicket } from '@/lib/types';


export const DigitalTicket = ({ saleData, onClose }: { saleData: SaleDataForTicket | null, onClose: () => void }) => {
    const ticketRef = useRef<HTMLDivElement>(null);

    
    if (!saleData) return null;
    
    const formatUsd = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatBs = (amount: number) => (amount * saleData.bcvRate).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatBsFromVes = (amount: number) => amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });


    const handlePrint = () => {
        const printWindow = window.open('', '', 'height=800,width=800');
        if (printWindow && ticketRef.current) {
            printWindow.document.write('<html><head><title>Ticket de Venta</title>');
            printWindow.document.write(`
                <style>
                    body { font-family: 'Courier New', monospace; margin: 0; padding: 10px; color: #000; }
                    .ticket { width: 100%; max-width: 302px; /* 80mm */ }
                    @media (max-width: 219px) { .ticket { max-width: 219px; /* 58mm */ } }
                    h1, h2, h3, p { margin: 0; padding: 0; }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .separator { border-top: 1px dashed #000; margin: 10px 0; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { font-size: 0.8rem; padding: 2px 0; }
                    .items-table th { text-align: left; border-bottom: 1px solid #000; }
                    .totals-table td { padding: 2px 0; }
                    .qr-code { margin: 10px auto; display: block; }
                    @page { size: auto; margin: 5mm; }
                </style>
            `);
            printWindow.document.write('</head><body>');
            printWindow.document.write(ticketRef.current.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
    };

    const handleDownloadImage = () => {
        if (ticketRef.current) {
            html2canvas(ticketRef.current, {
                 useCORS: true,
                 backgroundColor: '#ffffff',
                 scale: 2,
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `ticket-${saleData.id}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };
    
    const handleShareWhatsApp = () => {
        if (ticketRef.current) {
            let message = `*FacilitoPOS - Recibo de Venta*\n\n`;
            message += `Ticket: *${saleData.id}*\n`;
            message += `Fecha: ${new Date(saleData.date).toLocaleString('es-VE')}\n`;
            message += `Cliente: ${saleData.customer?.name || 'Cliente Ocasional'}\n\n`;
            message += `*--- Productos ---*\n`;
            saleData.items.forEach(item => {
                message += `${item.quantity} x ${item.name} - Bs ${formatBs(item.salePrice * item.quantity)}\n`;
            });
            message += `\n*Subtotal: Bs ${formatBs(saleData.subtotal)}*\n\n`;
            message += `*--- Pagos ---*\n`;
            saleData.payments.forEach(p => {
                if (!p.method) return;
                const amountInBs = p.method.currency === '$' ? p.amount * saleData.bcvRate : p.amount;
                message += `${p.method.name}: Bs ${formatBsFromVes(amountInBs)}\n`;
            });
             message += `\n*Total Pagado: Bs ${formatBs(saleData.totalPaid)}*\n`;
             if (saleData.totalChange > 0) {
                message += `*Vuelto: Bs ${formatBs(saleData.totalChange)}*\n`;
             }
            message += `\n_¡Gracias por su compra!_`;

            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }
    };


    return (
        <Dialog open={!!saleData} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Venta Completada</DialogTitle>
                    <DialogDescription>
                        Ticket de venta generado. Puede imprimirlo, descargarlo o compartirlo.
                    </DialogDescription>
                </DialogHeader>
                <div className="bg-white text-black p-4 rounded-lg max-h-[60vh] overflow-y-auto" id="ticket-content" ref={ticketRef}>
                    <div className="text-center">
                        <PosLogo className="text-2xl text-black" />
                        <p className="text-xs">RIF: J-12345678-9</p>
                        <p className="text-xs">Av. Principal, Local 1, Ciudad</p>
                        <p className="text-xs">Tel: 0212-555-5555</p>
                    </div>

                    <div className="separator"></div>

                    <p className="text-xs">Ticket: {saleData.id}</p>
                    <p className="text-xs">Fecha: {new Date(saleData.date).toLocaleString('es-VE')}</p>
                    <p className="text-xs">Cliente: {saleData.customer?.name || 'Cliente Ocasional'}</p>
                    <p className="text-xs">Cédula/RIF: {saleData.customer?.idNumber || 'N/A'}</p>

                    <div className="separator"></div>
                    
                    <table className="items-table">
                        <thead><tr><th>Desc</th><th>Cant</th><th>Precio</th><th>Total</th></tr></thead>
                        <tbody>
                        {saleData.items.map(item => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td className="text-center">{item.quantity}</td>
                                <td className="text-right">{formatBs(item.salePrice)}</td>
                                <td className="text-right">{formatBs(item.salePrice * item.quantity)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div className="separator"></div>
                    
                    <table className="totals-table">
                        <tbody>
                            <tr><td>SUBTOTAL:</td><td className="text-right">{formatBs(saleData.subtotal)}</td></tr>
                        </tbody>
                    </table>
                    
                    <div className="separator"></div>

                    <p className="text-xs font-bold">Forma de Pago:</p>
                    {saleData.payments.map((p, index) => {
                         if (!p.method) return null;
                         const amountInBs = p.method.currency === '$' ? p.amount * saleData.bcvRate : p.amount;
                         return (
                            <table key={index} className="totals-table">
                                <tbody><tr><td>{p.method?.name}</td><td className="text-right">Bs {formatBsFromVes(amountInBs)}</td></tr></tbody>
                            </table>
                         )
                    })}
                    <table className="totals-table font-bold">
                        <tbody><tr><td>TOTAL PAGADO:</td><td className="text-right">Bs {formatBs(saleData.totalPaid)}</td></tr></tbody>
                    </table>

                    {saleData.totalChange > 0 && (
                        <>
                        <div className="separator"></div>
                        <table className="totals-table font-bold">
                           <tbody><tr><td>VUELTO:</td><td className="text-right">Bs {formatBs(saleData.totalChange)}</td></tr></tbody>
                        </table>
                        </>
                    )}
                    
                    <div className="separator"></div>
                    <p className="text-center text-xs">¡Gracias por su compra!</p>
                </div>
                <DialogFooter className="sm:justify-start gap-2 pt-4">
                     <Button type="button" variant="secondary" onClick={handleShareWhatsApp}><Send className="mr-2 h-4 w-4"/> WhatsApp</Button>
                    <Button type="button" variant="secondary" onClick={handleDownloadImage}><Download className="mr-2 h-4 w-4"/> Descargar</Button>
                    <Button type="button" onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/> Imprimir</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
