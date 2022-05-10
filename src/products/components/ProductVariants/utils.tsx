import { ProductDetailsVariantFragment } from "@saleor/graphql";
import { IntlShape } from "react-intl";
import { CellBase } from "react-spreadsheet";

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
): CellBase<string> & { column: string } {
  switch (column) {
    case "name":
    case "sku":
    case "margin":
      return { value: variant[column]?.toString() ?? "", column };
  }

  if (isStockColumn.test(column)) {
    return {
      column,
      value: variant.stocks
        .find(stock => stock.warehouse.id === column.match(isStockColumn)[1])
        ?.quantity.toString()
    };
  }

  if (isChannelColumn.test(column)) {
    return {
      column,
      value: variant.channelListings
        .find(
          listing => listing.channel.id === column.match(isChannelColumn)[1]
        )
        ?.price.amount.toString()
    };
  }

  if (isAttributeColumn.test(column)) {
    return {
      column,
      readOnly: true,
      value: variant.attributes
        .find(
          attribute =>
            attribute.attribute.id === column.match(isAttributeColumn)[1]
        )
        ?.values.map(v => v.name)
        .join(", ")
    };
  }
}

export function getColumnName(
  name: string,
  variants: ProductDetailsVariantFragment[],
  intl: IntlShape
): string {
  switch (name) {
    case "name":
    case "sku":
    case "margin":
      return intl.formatMessage(messages[name]);
  }

  if (isStockColumn.test(name)) {
    return variants
      .map(variant => variant.stocks.map(stock => stock.warehouse))
      .flat()
      .find(warehouse => warehouse.id === name.match(isStockColumn)[1])?.name;
  }

  if (isChannelColumn.test(name)) {
    return variants
      .map(variant => variant.channelListings.map(listing => listing.channel))
      .flat()
      .find(channel => channel.id === name.match(isChannelColumn)[1])?.name;
  }

  if (isAttributeColumn.test(name)) {
    return variants
      .map(variant => variant.attributes.map(attribute => attribute.attribute))
      .flat()
      .find(attribute => attribute.id === name.match(isAttributeColumn)[1])
      ?.name;
  }

  return name;
}
