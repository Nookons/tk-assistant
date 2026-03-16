import {useState} from "react";

export function useStockSearch() {
    const [searchValue, setSearchValue] = useState('');

    const handleSearch = (v: string) => setSearchValue(v);
    const clearSearch = () => setSearchValue('');

    return { searchValue, handleSearch, clearSearch };
}