

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
    const formatBsFromVes = (amount: number) => amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatBs = (amount: number) => (amount * saleData.bcvRate).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });


    const handlePrint = () => {
        const printWindow = window.open('', '', 'height=800,width=800');
        if (printWindow && ticketRef.current) {
            printWindow.document.write('<html><head><title>Ticket de Venta</title>');
            printWindow.document.write(`
                <style>
                    body { font-family: 'Courier New', monospace; margin: 0; padding: 10px; color: #000; background: #fff; }
                    .ticket { width: 100%; max-width: 302px; margin: 0 auto; }
                    h1, h2, h3, p { margin: 0; padding: 0; font-family: 'Courier New', monospace; }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .separator { border-top: 1px dashed #000; margin: 10px 0; }
                    table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
                    th, td { padding: 2px 0; }
                    .items-table th { text-align: left; border-bottom: 1px solid #000; }
                    .items-table .total-col { text-align: right; }
                    .totals-table td { padding: 2px 0; }
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
            message += `Tasa: ${formatBsFromVes(saleData.bcvRate)} Bs/USD\n`;
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
                <div className="bg-white text-black p-4 rounded-lg max-h-[60vh] overflow-y-auto ticket" id="ticket-content" ref={ticketRef}>
                    <div className="text-center mb-2">
                        <h2 className="text-lg font-bold">FacilitoPOS</h2>
                        <p className="text-xs">Fecha: {new Date(saleData.date).toLocaleString('es-VE', { year: '2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</p>
                        <p className="text-xs">Tasa: {formatBsFromVes(saleData.bcvRate)} Bs / USD</p>
                    </div>

                    <div className="separator"></div>

                    <p className="text-xs">Cliente: {saleData.customer?.name || 'Cliente Genérico'}</p>
                    
                    <div className="separator"></div>

                    <h3 className="text-sm font-bold mb-1">Productos</h3>
                    <table className="items-table">
                        <thead><tr><th>Cant.</th><th>Producto</th><th className="total-col">Total</th></tr></thead>
                        <tbody>
                        {saleData.items.map((item, index) => (
                            <tr key={`${item.id}-${index}`}>
                                <td>{item.quantity}</td>
                                <td>{item.name}</td>
                                <td className="total-col">{formatBs(item.salePrice * item.quantity)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div className="separator"></div>
                    
                    <table className="totals-table">
                        <tbody>
                            <tr>
                                <td>Subtotal:</td>
                                <td className="text-right">
                                    <span className="font-bold">{formatBs(saleData.subtotal)} Bs</span>
                                    <br/>
                                    <span className="text-xs">(${formatUsd(saleData.subtotal)})</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div className="separator"></div>

                    <h3 className="text-sm font-bold mb-1">Pagos</h3>
                    <table className="totals-table">
                         <tbody>
                            {saleData.payments.map((p, index) => {
                                if (!p.method) return null;
                                const amountInBs = p.method.currency === '$' ? p.amount * saleData.bcvRate : p.amount;
                                return (
                                    <tr key={index}>
                                        <td>{p.method?.name}:</td>
                                        <td className="text-right">{formatBsFromVes(amountInBs)} Bs</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    
                    <div className="separator"></div>

                    <table className="totals-table">
                         <tbody>
                             <tr>
                                <td>Total Pagado:</td>
                                <td className="text-right">{formatBs(saleData.totalPaid)} Bs</td>
                            </tr>
                              <tr>
                                <td>Vuelto:</td>
                                <td className="text-right">{formatBs(saleData.totalChange)} Bs</td>
                            </tr>
                        </tbody>
                    </table>
                    
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
