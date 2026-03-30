import React from 'react';
import PagesHeader from "@/components/shared/PagesHeader";

const Page = () => {
    return (
        <div>
            <PagesHeader />
            <embed src="/docs/a42t/A42T.pdf" className={`fixed top-11 left-0 right-0 bottom-0`} width="100%" height="95.5%" />
        </div>
    );
};

export default Page;