import React, {useState} from 'react';
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {IRobotApiResponse} from "@/types/robot/robot";
import {useUserStore} from "@/store/user";

const AddCommentRobot = ({robot_data}: {robot_data: IRobotApiResponse}) => {

    const [value, setValue] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const user = useUserStore(state => state.current_user)

    const addComment = async () => {
        try {
            const res = await fetch(`/api/robots/add-comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ card_id: user?.card_id, robot_id: robot_data.id, comment: value }),
            })

            await res.json()

        } catch (e) {
            console.log(e);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <div>
                <Label className={`my-4`}>Add Comment</Label>
                <Textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full"
                />
                <div className={`space-x-2 mt-4`}>
                    <Button onClick={addComment} disabled={isLoading} variant="default">Submit</Button>
                    <Button disabled={isLoading} variant="outline">Clear</Button>
                </div>
            </div>
        </div>
    );
};

export default AddCommentRobot;