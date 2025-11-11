export interface IUserApiResponse {
    success: boolean;
    loginTime: number;
    user: IUser;
}

export interface IUser {
    id: number;
    created_at: string;
    user_name: string;
    card_id: number;
    email: string;
    phone: number;
    warehouse: string;
    updated_at: string;
    score: number;
    position: string;
}