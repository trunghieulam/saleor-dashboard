import Datagrid from "@saleor/components/Datagrid/Datagrid";
import {
  ProductDetailsVariantFragment,
  ProductFragment,
  RefreshLimitsQuery
} from "@saleor/graphql";
// import { isLimitReached } from "@saleor/utils/limits";
import React from "react";
import { useIntl } from "react-intl";

import { ChannelProps, ListActions, ReorderAction } from "../../../types";
import { getColumnData, getData } from "./utils";

interface ProductVariantsProps extends ListActions, ChannelProps {
  productId: string;
  disabled: boolean;
  limits: RefreshLimitsQuery["shop"]["limits"];
  product: ProductFragment;
  variants: ProductDetailsVariantFragment[];
  onVariantReorder: ReorderAction;
  onRowClick: (id: string) => void;
  onSetDefaultVariant(variant: ProductDetailsVariantFragment);
  onVariantsAdd();
}

export const ProductVariants: React.FC<ProductVariantsProps> = ({
  variants,
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
            "margin",
            ...variants[0]?.channelListings.map(
              channel => `channel:${channel.channel.id}`
            ),
            ...variants[0]?.stocks.map(stock => `stock:${stock.warehouse.id}`),
            ...variants[0]?.attributes.map(
              attribute => `attribute:${attribute.attribute.id}`
            )
          ].map(c => getColumnData(c, variants, intl))
        : [],
    [variants]
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
    />
  );
};
ProductVariants.displayName = "ProductVariants";
export default ProductVariants;
