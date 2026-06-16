import type { Metadata } from "next";
import { InstantSearchNextPage } from "../../../components/InstantSearchNextPage";
import {Suspense} from "react";

type pageProps = {params: {marketplace: string, locale: string}};

export const generateMetadata = async (): Promise<Metadata> => ({
  title: "someTitle",
})

const page: React.FC<pageProps> = ({ params }) => (<Suspense><InstantSearchNextPage params={params} /></Suspense>);

export default page;

