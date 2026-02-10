import React, {useState} from 'react';
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Separator} from "@/components/ui/separator";
import {Badge} from "@/components/ui/badge";
import {Bot, Copy, ZoomIn, ZoomOut, RotateCcw} from "lucide-react";
import {Label} from "@/components/ui/label";
import {Dialog, DialogContent, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {TransformWrapper, TransformComponent} from "react-zoom-pan-pinch";
import dayjs from "dayjs";
import TemplateEditDialog from "@/components/shared/Stock/TemplateEditDialog";
import {Item} from "@/components/ui/item";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {ButtonGroup} from "@/components/ui/button-group";
import TemplatePhotoChange from "@/components/shared/Stock/TemplatePhotoChange";

interface props {
    data: IStockItemTemplate;
}

const StockItemPreview: React.FC<props> = ({data}) => {
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

    return (
        <Item variant={`muted`} className={`flex items-center gap-2`}>
            <div className={`grid md:grid-cols-[120px_1fr] gap-4 w-full`}>
                <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                    <DialogTrigger asChild>
                        <div className="relative group cursor-pointer">
                            <Avatar className="w-full h-full rounded">
                                <AvatarImage
                                    src={data.avatar_url || "/img/img_none.svg"}
                                    alt="Part Avatar"
                                    className="object-cover"
                                />
                                {!data?.avatar_url && <AvatarFallback>TK</AvatarFallback>}
                            </Avatar>
                            <div className="absolute inset-0  opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                                <ZoomIn className="w-6 h-6" />
                            </div>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh]">
                        <div className="flex flex-col gap-4">
                            <TransformWrapper
                                initialScale={1}
                                minScale={0.5}
                                maxScale={5}
                                centerOnInit={true}
                            >
                                {({zoomIn, zoomOut, resetTransform}) => (
                                    <div>
                                        <div className={`flex justify-between gap-2 flex-wrap mt-4`}>
                                            <ButtonGroup className="flex justify-center mb-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => zoomIn()}
                                                >
                                                    <ZoomIn className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => zoomOut()}
                                                >
                                                    <ZoomOut className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => resetTransform()}
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </Button>
                                            </ButtonGroup>
                                            <TemplatePhotoChange part={data} />
                                        </div>

                                        {/* Контейнер с изображением */}
                                        <TransformComponent
                                            wrapperClass="w-auto max-h-[80vh] rounded-lg overflow-hidden"
                                            contentClass="w-full h-full"
                                        >
                                            <img
                                                src={data.avatar_url || "/img/img_none.svg"}
                                                alt="Part Avatar"
                                                className="w-full h-full object-contain"
                                                draggable={false}
                                            />
                                        </TransformComponent>

                                        <p className="text-xs text-muted-foreground text-center mt-2">
                                            Use mouse wheel for zoom.
                                        </p>
                                    </div>
                                )}
                            </TransformWrapper>
                        </div>
                    </DialogContent>
                </Dialog>

                <div className={`flex flex-col gap-2 w-full`}>
                    <p>{data.description_eng}</p>
                    <Separator />
                    <p>{data.description_orginall}</p>
                </div>
            </div>

            <div className={`w-full flex items-center justify-between mt-2`}>
                <Badge className="cursor-pointer">
                    <Copy className="w-3 h-3 mr-1" /> {data.material_number}
                </Badge>
                <Label className={`text-xs text-muted-foreground`}>
                    {dayjs(data.updated_at).format('HH:mm · MMM D, YYYY')}
                </Label>
                <div className={`flex items-center gap-4`}>
                    <Label className={`text-xs`}>
                        <Bot className="w-3 h-3 inline mr-1" />
                        {data.robot_match?.join(' | ')}
                    </Label>
                    <TemplateEditDialog part={data} />
                </div>
            </div>
        </Item>
    );
};

export default StockItemPreview;