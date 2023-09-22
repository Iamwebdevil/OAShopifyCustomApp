import React, { useState, useCallback } from 'react';
import { json } from "@remix-run/node";

import {
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  VerticalStack,
  FormLayout,
  TextField,
  Button,
  Form,
  LegacyCard,
  DataTable,
  Scrollable
} from '@shopify/polaris';
import { authenticate } from "../shopify.server";



export const loader = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);

  const { input1, input2, endYear, endMonth } = params;

  const createdAt1 = `${input1}-${input2}`;
  const createdAt2 = `${endYear}-${endMonth}`;
  const mysearchQuery = `created_at:>=${createdAt1} AND created_at:<${createdAt2}`;
  console.log(mysearchQuery);
  const response = await admin.graphql(
   `#graphql
    query gettingdata($mysearchQuery: String!) {
      orders(first : 200, query :$mysearchQuery) {
        edges {
          node {
            id
            customerJourneySummary{
              momentsCount
            }
            totalPriceSet {
              shopMoney {
                amount
              }

            }
          }
        }
      }
    }`,
    { variables :{
      mysearchQuery : `${mysearchQuery}`
    }
    }

  );
  const OrderData = await response.json();
  return json(OrderData);
};


export default function CustomData() {

  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');
  const [showAverageVisitsTable, setShowAverageVisitsTable] = useState(false);
  const [showBreakdownTable, setShowBreakdownTable] = useState(false);
  const [priceRanges, setPriceRanges] = useState([
    { min: 0, max: 0 },
  ]);


  const handleSubmit = useCallback(() => {
    const guna1 = input1;
    const guna2 = input2;

    // Check if input1, input2, and input3 have valid values
    if (guna1 >= 0) {
      // Update the price ranges based on inputs
      setPriceRanges([
        { min: guna1, max: guna2 },
      ]);

      // Set state to show the table
      setShowAverageVisitsTable(true);


      // Reset the input fields after submission
      setInput1('');
      setInput2('');
    } else {
      // Display an error message if the input values are not valid
      alert('Please enter valid price ranges.');
    }
  }, [input1, input2]);


  const handleInput1Change = useCallback((value) => setInput1(value), []);
  const handleInput2Change = useCallback((value) => setInput2(value), []);

  const ordersData = useLoaderData(); // initialising with already fetched the ordersData

  // Extract the relevant orders data
  const orders = ordersData.data.orders.edges.map((edge) => edge.node);

  // Function to calculate the breakdown
  function calculateOrderBreakdown(orders) {
    const breakdown = {};

    orders.forEach((order) => {
      const momentsCount = order.customerJourneySummary.momentsCount;

      if (!breakdown[momentsCount]) {
        breakdown[momentsCount] = 0;
      }

      breakdown[momentsCount]++;
    });

    return breakdown;
  }

  // Calculate the breakdown
  const orderBreakdown = calculateOrderBreakdown(orders);

  // Calculate total average price
let totalAveragePrice = 0;
let totalOrdersCount = 0;

const ordertableRows = Object.entries(orderBreakdown).map(([momentsCount, count]) => {
  let description = `Orders happened on ${momentsCount} visits`;

  // Check if visit count is 0 and update the description
  if (momentsCount === '0') {
    description = 'Orders with no conversion data';
  }

  // Calculate the average price for orders in this visit count
  const filteredOrders = orders.filter((order) => {
    return order.customerJourneySummary.momentsCount === Number(momentsCount);
  });

  const totalOrderPrice = filteredOrders.reduce((total, order) => {
    return total + parseFloat(order.totalPriceSet.shopMoney.amount);
  }, 0);

  const averagePrice =
    filteredOrders.length > 0
      ? (totalOrderPrice / filteredOrders.length).toFixed(2)
      : 'N/A';

  // Add the average price to the total if it's not 'N/A'
  if (averagePrice !== 'N/A') {
    totalAveragePrice += parseFloat(averagePrice);
    totalOrdersCount += count; // Keep track of total orders count
  }

  return [description, count, averagePrice];
});

const ordertableHeadings = ['Description', 'Order Count', 'Average Price'];

// Add the total average price row
const totalAveragePriceRow = ['Total', totalOrdersCount, totalAveragePrice.toFixed(2)];
ordertableRows.push(totalAveragePriceRow);










  // Calculate average visits for each price range
  const averageVisits = priceRanges.map((range) => {
    const filteredOrders = orders.filter((order) => {
      const totalPrice = order.totalPriceSet.shopMoney.amount;
      return totalPrice >= range.min && totalPrice <= range.max;
    });

    // Calculate the total number of visits for orders in the range
    const totalVisits = filteredOrders.reduce(
      (acc, order) => acc + order.customerJourneySummary.momentsCount,
      0
    );

    // Calculate the average number of visits
    const average =
      filteredOrders.length > 0 ? Math.round(totalVisits / filteredOrders.length) : 0;

    return {
      priceRange: `${range.min}-${range.max}`,
      averageVisits: average,
    };
  });

  // Create an array for the table rows for average visits
  const averageVisitsTableRows = averageVisits.map((item) => [
    `${item.priceRange}`,
    item.averageVisits,
  ]);

  const averageVisitsTableHeadings = ['Price Range', 'Average Visits'];

  return (
    <Page>
    <ui-title-bar title="Analysis Breakdown" />
    <Layout>
    <Layout.Section>
      <Layout>
        <Layout.Section>
          <Card>
            <VerticalStack gap="3">
              <Text as="p" variant="bodyMd">
                You Are Viewing Analysis Page Which Contains Two Sections.
                Section 1 : Table Consists of Vist to Orders Breadown Data Analaysis
                Section 2 : Submit Three Prices To View Average Visits Within Price Range
              </Text>
            </VerticalStack>
          </Card>
        </Layout.Section>
        <Layout.Section secondary>
          <Card>
            <VerticalStack gap="2">
              <Text as="h2" variant="headingMd">
                Instructions
              </Text>
              <List spacing="extraTight">
                <List.Item>
                    Note : Enter Prices in the Average Breakdown form to view Average Visits Per Order
                </List.Item>
              </List>
            </VerticalStack>
          </Card>
        </Layout.Section>
      </Layout>
      </Layout.Section>
      <Layout.Section style={{ marginTop : '50px' }}>
      <Page >
      <Card>
      <Page title="Orders Breakdown By Visits">
      <div style={{ marginTop : '50px' }}></div>
    <Layout.Section>
    <LegacyCard>
    <Scrollable shadow style={{height: '300px'}} focusable>
      <DataTable
        columnContentTypes={['text', 'numeric']}
        headings={ordertableHeadings}
        rows={ordertableRows}
      />
      </Scrollable>
      </LegacyCard>
    </Layout.Section>
    </Page>
    </Card>
    </Page>
    </Layout.Section>

    <Layout.Section style={{ marginTop : '50px' }}>
    <Page >
    <Card>
    <Layout.Section>
    <Page title = "Average Visits Per Order Range">
    <Layout.Section>
    <div style={{ marginBottom : '50px' }}>
        <b> Step 1 : Enter prices to show analysis within those price ranges </b>
        </div>
        <Form name="AverageVists" onSubmit={handleSubmit}>
          <FormLayout>
            <FormLayout.Group>

              <TextField
                value={input1}
                onChange={handleInput1Change}
                label="Order Total From :"
                type="number"
                autoComplete="off"
              />
              <TextField
                value={input2}
                onChange={handleInput2Change}
                label="Order Total To :"
                type="number"
                autoComplete="off"
              />

            </FormLayout.Group>
            <Button submit>Submit</Button>
          </FormLayout>
        </Form>
    </Layout.Section>
    {showAverageVisitsTable && (
              <Layout.Section>
                <LegacyCard>
                  <DataTable
                    columnContentTypes={['text', 'numeric']}
                    headings={averageVisitsTableHeadings}
                    rows={averageVisitsTableRows}
                  />
                </LegacyCard>
              </Layout.Section>
          )}

    </Page>
    </Layout.Section>
    </Card>
    </Page>
    </Layout.Section>
    </Layout>
    </Page>
  );
}
