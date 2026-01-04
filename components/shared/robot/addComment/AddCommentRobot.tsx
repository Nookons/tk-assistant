import React, {useState} from 'react';
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {IRobot} from "@/types/robot/robot";
import {useUserStore} from "@/store/user";
import { Loader2 } from "lucide-react";
import {useRobotsStore} from "@/store/robotsStore"; // Импортируем иконку для индикации загрузки

const AddCommentRobot = ({robot_data}: {robot_data: IRobot}) => {
    const [commentValue, setCommentValue] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const user = useUserStore(state => state.current_user)

    const updateRobot = useRobotsStore(state => state.updateRobot)

    const addComment = async () => {
        if (!user?.card_id || !commentValue.trim()) {
            // Предотвращаем отправку, если нет пользователя или комментарий пуст
            console.error("User or comment is missing.");
            return;
        }

        setIsSubmitting(true); // 1. Начинаем отправку

        try {
            const res = await fetch(`/api/robots/add-comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    card_id: user.card_id,
                    robot_id: robot_data.id,
                    comment: commentValue
                }),
            })

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            // const data = await res.json() // Если нужно обработать ответ

            updateRobot(robot_data.id, {

            })
            setCommentValue(""); // 2. Очищаем поле ввода после успешной отправки
            window.location.reload();

        } catch (e) {
            console.error("Failed to add comment:", e);
            // 3. Вы можете добавить здесь логику для отображения ошибки пользователю

        } finally {
            setIsSubmitting(false) // 4. Завершаем отправку (независимо от успеха/неудачи)
        }
    }

    // Функция для очистки поля ввода
    const handleClear = () => {
        setCommentValue("");
    }

    // Кнопка "Submit" будет отключена, если:
    // 1. Процесс отправки уже идет (`isSubmitting`)
    // 2. Поле ввода пустое (после обрезки пробелов)
    const isSubmitDisabled = isSubmitting || !commentValue.trim();

    return (
        <div>
            <div>
                <Label className={`my-4`}>Add Comment</Label>
                <Textarea
                    value={commentValue}
                    onChange={(e) => setCommentValue(e.target.value)}
                    className="w-full"
                    disabled={isSubmitting} // 5. Отключаем ввод во время отправки
                />
                <div className={`space-x-2 mt-4`}>
                    <Button
                        onClick={addComment}
                        disabled={isSubmitDisabled}
                        variant="default"
                    >
                        {/* 6. Отображаем индикатор загрузки, если идет отправка */}
                        {isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Submit
                    </Button>
                    <Button
                        onClick={handleClear}
                        disabled={isSubmitting}
                        variant="outline"
                    >
                        Clear
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AddCommentRobot;