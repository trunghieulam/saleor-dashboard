import Datagrid from "@saleor/components/Datagrid/Datagrid";
import {
  ChannelFragment,
  ProductDetailsVariantFragment,
  RefreshLimitsQuery,
  WarehouseFragment
} from "@saleor/graphql";
import { buttonMessages } from "@saleor/intl";
import { Button } from "@saleor/macaw-ui";
// import { isLimitReached } from "@saleor/utils/limits";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { getColumnData, getData } from "./utils";

interface ProductVariantsProps {
  channels: ChannelFragment[];
  limits: RefreshLimitsQuery["shop"]["limits"];
  variants: ProductDetailsVariantFragment[];
  warehouses: WarehouseFragment[];
  onVariantBulkDelete: (ids: string[]) => void;
  onRowClick: (id: string) => void;
  onSetDefaultVariant: (id: string) => void;
}

export const ProductVariants: React.FC<ProductVariantsProps> = ({
  channels,
  variants,
  warehouses,
  onVariantBulkDelete,
  onRowClick
}) => {
  const intl = useIntl();
  // const limitReached = isLimitReached(limits, "productVariants");
  const columns = React.useMemo(
    () =>
      variants?.length > 0
        ? [
            "name",
            "sku",
            ...channels?.map(channel => `channel:${channel.id}`),
            ...warehouses?.map(warehouse => `stock:${warehouse.id}`),
            ...variants[0]?.attributes.map(
              attribute => `attribute:${attribute.attribute.id}`
            )
          ].map(c => getColumnData(c, variants, intl))
        : [],
    [variants, warehouses, channels]
  );

  return (
    <Datagrid
      availableColumns={columns}
      data={variants}
      getData={getData}
      menuItems={id => [
        {
          label: "Edit Variant",
          onSelect: () => onRowClick(id)
        }
      ]}
      onChange={() => undefined}
    >
      {selected => (
        <Button
          variant="tertiary"
          onClick={() => onVariantBulkDelete(selected)}
        >
          <FormattedMessage {...buttonMessages.delete} />
        </Button>
      )}
    </Datagrid>
  );
};
ProductVariants.displayName = "ProductVariants";
export default ProductVariants;
