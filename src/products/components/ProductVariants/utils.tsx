import {
  AvailableColumn,
  DatagridCell
} from "@saleor/components/Datagrid/types";
import { ProductDetailsVariantFragment } from "@saleor/graphql";
import { IntlShape } from "react-intl";

import messages from "./messages";

const isStockColumn = /^stock:(.*)/;
const isChannelColumn = /^channel:(.*)/;
const isAttributeColumn = /^attribute:(.*)/;

export function isEditable(column: string): boolean {
  return column !== "name";
}

export function getData(
  variant: ProductDetailsVariantFragment,
  column: string
): DatagridCell {
  switch (column) {
    case "name":
    case "sku":
    case "margin":
      return {
        id: variant.id,
        value: variant[column]?.toString() ?? "",
        column,
        type: "string"
      };
  }

  if (isStockColumn.test(column)) {
    return {
      column,
      id: variant.id,
      value: variant.stocks
        .find(stock => stock.warehouse.id === column.match(isStockColumn)[1])
        ?.quantity.toString(),
      type: "string"
    };
  }

  if (isChannelColumn.test(column)) {
    const listing = variant.channelListings.find(
      listing => listing.channel.id === column.match(isChannelColumn)[1]
    );

    return {
      column,
      id: variant.id,
      value: listing?.price.amount.toString(),
      type: "moneyToggle",
      toggled: !!listing.price,
      currency: listing?.price.currency
    };
  }

  if (isAttributeColumn.test(column)) {
    return {
      column,
      id: variant.id,
      readOnly: true,
      value: variant.attributes
        .find(
          attribute =>
            attribute.attribute.id === column.match(isAttributeColumn)[1]
        )
        ?.values.map(v => v.name)
        .join(", "),
      type: "string"
    };
  }
}

export function getColumnData(
  name: string,
  variants: ProductDetailsVariantFragment[],
  intl: IntlShape
): AvailableColumn {
  const common = {
    value: name
  };

  switch (name) {
    case "name":
    case "sku":
      return {
        ...common,
        label: intl.formatMessage(messages[name]),
        type: "string"
      };
    case "margin":
      return {
        ...common,
        label: intl.formatMessage(messages[name]),
        type: "money"
      };
  }

  if (isStockColumn.test(name)) {
    return {
      ...common,
      label: variants
        .map(variant => variant.stocks.map(stock => stock.warehouse))
        .flat()
        .find(warehouse => warehouse.id === name.match(isStockColumn)[1])?.name,
      type: "string"
    };
  }

  if (isChannelColumn.test(name)) {
    return {
      ...common,
      label: variants
        .map(variant => variant.channelListings.map(listing => listing.channel))
        .flat()
        .find(channel => channel.id === name.match(isChannelColumn)[1])?.name,
      type: "moneyToggle"
    };
  }

  if (isAttributeColumn.test(name)) {
    return {
      ...common,
      label: variants
        .map(variant =>
          variant.attributes.map(attribute => attribute.attribute)
        )
        .flat()
        .find(attribute => attribute.id === name.match(isAttributeColumn)[1])
        ?.name,
      type: "string"
    };
  }

  throw new Error(`Unknown column: ${name}`);
}
