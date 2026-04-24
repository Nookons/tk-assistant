import {supabase} from "@/lib/supabase/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {IIssueTemplate} from "@/types/Exception/ExceptionParse";
import {IRobotException} from "@/types/Exception/Exception";
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(utc);
dayjs.extend(isoWeek)

export class ExceptionService {

    static async removeException(id: number): Promise<number> {
        const { error } = await supabase
            .from('exceptions_glpc')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete exception error:', error);
            return 0;
        }

        return id;
    }

    static async addException(data: Partial<IRobotException>): Promise<IRobotException> {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid exception data');
        }

        const { data: response, error } = await supabase
            .from('exceptions_glpc')
            .insert(data)
            .select('*')
            .single();

        if (error) {
            console.error('Add exception error:', error);
            throw new Error(`Failed to add exception: ${error.message}`);
        }

        if (!response) {
            throw new Error('Insert succeeded but no data returned');
        }

        return response;
    }

    static async createTemplate(data: Omit<IIssueTemplate, "id" | "created_at" | "updated_at" | "updated_by">): Promise<IIssueTemplate | null> {
        const { data: template, error } = await supabase
            .from('issue_templates')
            .insert(data)
            .select()
            .single(); // ← возвращает созданную запись

        if (error) {
            console.error('Create template error:', error);
            return null;
        }

        return template;
    }


    static async getExceptionsWeek(warehouse: string): Promise<IRobotException[] | null> {
        const weekStart = dayjs.utc().startOf('isoWeek').toISOString();

        const { data, error } = await supabase
            .from('exceptions_glpc')
            .select('*')
            .gte('error_start_time', weekStart)
            .eq('warehouse', warehouse)
            .order('error_start_time', { ascending: false });

        if (error) {
            console.error(error);
            return null;
        }

        return data as IRobotException[];
    }


    static async getExceptionsHistory(warehouse: string): Promise<{ currentMonth: number; prevMonth: number } | null> {
        const currentMonthStart = dayjs.utc().startOf('month').toISOString();
        const prevMonthStart = dayjs.utc().subtract(1, 'month').startOf('month').toISOString();
        const prevMonthEnd = dayjs.utc().subtract(1, 'month').endOf('month').toISOString();

        const [{ count: currentMonth }, { count: prevMonth }] = await Promise.all([
            supabase
                .from('exceptions_glpc')
                .select('*', { count: 'exact', head: true })
                .gte('error_start_time', currentMonthStart)
                .eq('warehouse', warehouse),

            supabase
                .from('exceptions_glpc')
                .select('*', { count: 'exact', head: true })
                .gte('error_start_time', prevMonthStart)
                .lte('error_start_time', prevMonthEnd)
                .eq('warehouse', warehouse),
        ]);

        return {
            currentMonth: currentMonth ?? 0,
            prevMonth: prevMonth ?? 0,
        };
    }

    static async getExceptionsChartHistory(warehouse: string): Promise<IRobotException[]> {
        const currentMonthStart = dayjs.utc().startOf('month').subtract(1, 'month').toISOString();

        const pageSize = 1000;
        let page = 0;
        let all: IRobotException[] = [];

        while (true) {
            const { data, error } = await supabase
                .from('exceptions_glpc')
                .select('*')
                .gte('error_start_time', currentMonthStart)
                .eq('warehouse', warehouse)
                .range(page * pageSize, (page + 1) * pageSize - 1)
                .order('error_start_time', { ascending: true });

            if (error) throw new Error(error.message);
            if (!data?.length) break;

            all = [...all, ...data];
            if (data.length < pageSize) break;
            page++;
        }

        return all;
    }
}