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
import { getColumnName, getData } from "./utils";

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
            ...variants[0]?.stocks.map(stock => `stock:${stock.warehouse.id}`),
            ...variants[0]?.channelListings.map(
              channel => `channel:${channel.channel.id}`
            ),
            ...variants[0]?.attributes.map(
              attribute => `attribute:${attribute.attribute.id}`
            )
          ].map(c => ({ label: getColumnName(c, variants, intl), value: c }))
        : [],
    [variants]
  );

  return (
    <Datagrid
      availableColumns={columns}
      data={variants}
      getData={getData}
      menuItems={row => [
        {
          label: "Edit Variant",
          onSelect: () => onRowClick(row[0].id)
        }
      ]}
    />
  );
};
ProductVariants.displayName = "ProductVariants";
export default ProductVariants;
