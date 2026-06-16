"use client";

import { InstantSearchNext } from "react-instantsearch-nextjs";
import { Configure } from "react-instantsearch";
import { liteClient } from "algoliasearch/lite";

const searchClient = liteClient("ALGOLIA_APP_ID", "ALGOLIA_API_KEY");

export function InstantSearchNextPage({
  params,
}: {
  params: { marketplace: string; locale: string };
}) {
  const indexName = `${params.marketplace}-${params.locale}-stores`;

  return (
    <div>
      <h1>Store Locator</h1>
      <p>
        This page demonstrates the issue where InstantSearchNext tries to access
        request headers during static pre-rendering.
      </p>

      {/* This component will cause the error during `next build` */}
      <InstantSearchNext
        searchClient={searchClient}
        indexName={indexName}
        routing={{
          router: {
            cleanUrlOnDispose: false,
          },
        }}
      >
        <Configure hitsPerPage={20} />
        <div style={{ padding: "20px", border: "1px solid #ccc" }}>
          <p>Search results would appear here...</p>
          <p>
            If this page renders successfully during `next build`, the issue is
            fixed.
          </p>
        </div>
      </InstantSearchNext>
    </div>
  );
}

