
"use client";

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Printer, Download, Send } from "lucide-react";
import { cn } from '@/lib/utils';
import { SaleDataForTicket } from '@/lib/types';
import { Separator } from '../ui/separator';

export const DigitalTicket = ({ saleData, onClose }: { saleData: SaleDataForTicket | null, onClose: () => void }) => {
    const ticketRef = useRef<HTMLDivElement>(null);

    
    if (!saleData) return null;
    
    // Placeholder business data - in a real app, this would come from a context or props
    const businessData = {
        name: "FacilitoPOS Demo C.A.",
        rif: "J-12345678-9",
        address: "Av. Principal, Local 1, Ciudad, Estado",
        phone: "0414-1234567",
    };

    const formatUsd = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatBsFromVes = (amount: number) => amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatBs = (amount: number) => (amount * saleData.bcvRate).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });


    const handlePrint = () => {
        const printWindow = window.open('', '', 'height=800,width=800');
        if (printWindow && ticketRef.current) {
            printWindow.document.write('<html><head><title>Ticket de Venta</title>');
            // Basic styling for the print window to match the ticket's look
            printWindow.document.write(`
                <style>
                    body { font-family: 'monospace', sans-serif; margin: 0; padding: 15px; color: #000; background: #fff; font-size: 10px; }
                    .ticket { width: 100%; max-width: 320px; margin: 0 auto; }
                    h1, h2, h3, p, div { margin: 0; padding: 0; }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .font-bold { font-weight: bold; }
                    .mt-1 { margin-top: 4px; }
                    .mt-2 { margin-top: 8px; }
                    .mb-1 { margin-bottom: 4px; }
                    .mb-2 { margin-bottom: 8px; }
                    .text-xs { font-size: 9px; }
                    .separator { border-top: 1px dashed #555; margin: 8px 0; }
                    table { width: 100%; border-collapse: collapse; font-size: 9px; }
                    th, td { padding: 2px 0; }
                    .items-table th { text-align: left; border-bottom: 1px solid #555; }
                    .items-table .text-right { text-align: right; }
                    .totals-section { display: flex; justify-content: flex-end; }
                    .totals-table { width: auto; min-width: 150px; }
                    .payment-details p { display: flex; justify-content: space-between; }
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
            // Simplified text version for WhatsApp
            let message = `*${businessData.name}*\n`;
            message += `${businessData.rif}\n\n`;
            message += `*Ticket:* ${saleData.id}\n`;
            message += `*Fecha:* ${new Date(saleData.date).toLocaleString('es-VE')}\n`;
            message += `*Cliente:* ${saleData.customer?.name || 'Cliente Ocasional'}\n\n`;
            message += `*--- Productos ---*\n`;
            saleData.items.forEach(item => {
                message += `${item.quantity} x ${item.name} - Bs ${formatBs(item.salePrice * item.quantity)}\n`;
            });
            message += `\n*Subtotal: Bs ${formatBs(saleData.subtotal)}*\n`;
            message += `*Total: Bs ${formatBs(saleData.subtotal)}*\n\n`;
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
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Ticket de Venta</DialogTitle>
                    <DialogDescription>
                        Recibo generado. Puede imprimirlo, descargarlo o compartirlo.
                    </DialogDescription>
                </DialogHeader>
                <div className="bg-white text-black p-2 rounded-sm max-h-[70vh] overflow-y-auto" id="ticket-content">
                    <div ref={ticketRef} className="ticket text-[10px] leading-tight font-mono p-1">
                        {/* Business Info */}
                        <div className="text-center mt-1">
                            <h2 className="text-sm font-bold">{businessData.name}</h2>
                            <p>{businessData.rif}</p>
                            <p>{businessData.address}</p>
                            <p>Telf: {businessData.phone}</p>
                        </div>
                        
                        <div className="separator mt-2"></div>

                        {/* Sale & Client Info */}
                        <div className='flex justify-between text-[9px] mt-2'>
                             <p className='font-bold'>Ticket: {saleData.id}</p>
                             <p>Fecha: {new Date(saleData.date).toLocaleString('es-VE')}</p>
                        </div>
                        <div className="mt-2">
                            <p className='font-bold'>Cliente:</p>
                            <p>{saleData.customer?.name || 'Cliente Ocasional'}</p>
                            <p>{saleData.customer?.idNumber || 'V-00000000'}</p>
                            <p className='truncate'>{saleData.customer?.address || 'N/A'}</p>
                        </div>

                        <div className="separator mt-2"></div>
                        
                        {/* Items Table */}
                        <table className="w-full items-table mt-2">
                            <thead>
                                <tr>
                                    <th className='w-1/12'>Cant</th>
                                    <th className='w-5/12'>Producto</th>
                                    <th className='w-3/12 text-right'>Precio</th>
                                    <th className='w-3/12 text-right'>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                            {saleData.items.map((item, index) => (
                                <tr key={`${item.id}-${index}`} className="text-[9px]">
                                    <td className='align-top'>{item.quantity}</td>
                                    <td>
                                        <div>{item.name}</div>
                                        <div className='text-[8px]'>Cod: {item.id}</div>
                                    </td>
                                    <td className='align-top text-right'>{formatBs(item.salePrice)}</td>
                                    <td className='align-top text-right font-bold'>{formatBs(item.salePrice * item.quantity)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        <div className="separator"></div>
                        
                        {/* Totals Section */}
                        <div className="flex justify-end mt-2">
                             <div className="w-8/12">
                                <div className='flex justify-between'>
                                    <p>Subtotal:</p>
                                    <p className="font-bold">Bs {formatBs(saleData.subtotal)}</p>
                                </div>
                                <div className="separator"></div>
                                <div className='flex justify-between font-bold text-xs'>
                                    <p>TOTAL:</p>
                                    <div className='text-right'>
                                      <p>Bs {formatBs(saleData.subtotal)}</p>
                                      <p className="text-[9px] font-normal text-gray-600">(${formatUsd(saleData.subtotal)})</p>
                                    </div>
                                </div>
                             </div>
                        </div>

                        <div className="separator"></div>

                        {/* Payment Details */}
                        <div className="mt-2 payment-details">
                            <p className='font-bold mb-1'>Detalle de Pago:</p>
                             <div className='space-y-1'>
                                {saleData.payments.map((p, index) => {
                                    if (!p.method) return null;
                                    const amountInBs = p.method.currency === '$' ? p.amount * saleData.bcvRate : p.amount;
                                    return (
                                        <p key={index}>
                                            <span>{p.method.name}:</span>
                                            <span className='font-bold'>Bs {formatBsFromVes(amountInBs)}</span>
                                        </p>
                                    )
                                })}
                             </div>
                            
                            <div className="separator mt-2"></div>
                             <div className='space-y-1'>
                                <div className='flex justify-between mt-1'>
                                    <p>Total Pagado:</p>
                                    <p>Bs {formatBs(saleData.totalPaid)}</p>
                                </div>
                                {saleData.totalChange > 0 && (
                                    <div className='flex justify-between font-bold'>
                                        <p>Vuelto:</p>
                                        <p>Bs {formatBs(saleData.totalChange)}</p>
                                    </div>
                                )}
                             </div>
                        </div>

                        <div className="separator"></div>
                        <p className="text-center text-xs mt-2">¡Gracias por su compra!</p>
                        <p className="text-center text-[8px] mt-1">Tasa: {formatBsFromVes(saleData.bcvRate)} Bs/USD</p>

                         <div className="text-center mt-2">
                           <span className="font-bold text-sm">
                                Facilito
                                <span style={{ color: '#FFCD00' }}>P</span>
                                <span style={{ color: '#0033A0' }}>O</span>
                                <span style={{ color: '#CE1126' }}>S</span>
                             </span>
                             <p className="text-[9px]">Venezuela</p>
                             <p className="text-[8px] mt-1">Tecnología Impulsada por DiazSoft</p>
                        </div>
                    </div>
                </div>
                <DialogFooter className="sm:justify-between gap-2 pt-4">
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="secondary" onClick={handleShareWhatsApp}><Send className="mr-2 h-4 w-4"/> WhatsApp</Button>
                        <Button type="button" variant="secondary" onClick={handleDownloadImage}><Download className="mr-2 h-4 w-4"/> Descargar</Button>
                        <Button type="button" onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/> Imprimir</Button>
                    </div>
                    <Button type="button" variant="outline" onClick={onClose}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
