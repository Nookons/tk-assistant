'use client'
import React, {useState} from 'react';
import {Skeleton} from "@/components/ui/skeleton";
import {Dialog, DialogContent, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {ButtonGroup} from "@/components/ui/button-group";
import {TransformWrapper, TransformComponent} from "react-zoom-pan-pinch";
import Image from "next/image";
import {ZoomIn, ZoomOut, RotateCcw} from "lucide-react";
import {cn} from "@/lib/utils";

const StockPartImage = ({avatar_url}: {avatar_url: string}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="relative w-full aspect-square rounded-md overflow-hidden mb-2 group">
                {isLoading && avatar_url && (
                    <Skeleton className="absolute inset-0 w-full h-full"/>
                )}

                {avatar_url ? (
                    <>
                        <Image
                            key={avatar_url}
                            src={avatar_url}
                            alt="item image"
                            fill
                            className={cn("object-cover transition-opacity", isLoading ? "opacity-0" : "opacity-100")}
                            onLoad={() => setIsLoading(false)}
                            onAbort={() => setIsLoading(false)}
                        />
                        {!isLoading && (
                            <div
                                onClick={() => setOpen(true)}
                                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity backdrop-blur-sm flex items-center justify-center cursor-pointer rounded"
                            >
                                <ZoomIn className="w-6 h-6"/>
                            </div>
                        )}
                    </>
                ) : (
                    <div
                        onClick={() => setOpen(true)}
                        className="flex h-full bg-muted justify-center items-center cursor-pointer"
                    >
                        NO IMG
                    </div>
                )}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[90vh]">
                    <DialogTitle className="sr-only">Image preview</DialogTitle>
                    <TransformWrapper
                        initialScale={1}
                        minScale={0.5}
                        maxScale={5}
                        centerOnInit={true}
                    >
                        {({zoomIn, zoomOut, resetTransform}) => (
                            <div className="flex flex-col gap-2 mt-4">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <ButtonGroup className="flex">
                                        <Button variant="ghost" size="sm" onClick={() => zoomIn()}>
                                            <ZoomIn className="w-4 h-4"/>
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => zoomOut()}>
                                            <ZoomOut className="w-4 h-4"/>
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => resetTransform()}>
                                            <RotateCcw className="w-4 h-4"/>
                                        </Button>
                                    </ButtonGroup>
                                </div>

                                <TransformComponent
                                    wrapperClass="w-full max-h-[70vh] rounded-lg overflow-hidden"
                                    contentClass="w-full h-full"
                                >
                                    <img
                                        src={avatar_url || "/img/img_none.svg"}
                                        alt="Part Avatar"
                                        className="w-full h-full object-contain"
                                        draggable={false}
                                    />
                                </TransformComponent>

                                <p className="text-xs text-muted-foreground text-center">
                                    Use mouse wheel for zoom.
                                </p>
                            </div>
                        )}
                    </TransformWrapper>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default StockPartImage;