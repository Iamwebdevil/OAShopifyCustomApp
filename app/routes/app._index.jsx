import React, { useState, useCallback  } from 'react';
import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { json } from "@remix-run/node";
import {
  useActionData,
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
  DataTable
} from '@shopify/polaris';

import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export default function UserInputForm() {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [endYear, setEndYear] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const navigate = useNavigate();

  const handleSubmit = useCallback(() => {

    if (input1!= null && input2 != null) {

      navigate(`../app/fetchingcustomdata/${input1}/${input2}/${endYear}/${endMonth}`);


    setInput1('');
    setInput2('');
    setEndYear('');
    setEndMonth('');
  } else {
    // Display an error message if the input values are not valid
    alert('Please enter valid year or month (example : year : 2023, month : 12 )');
  }


}, [input1, input2, endYear, endMonth]);

  const handleinput1Change = useCallback((value) => setInput1(value), []);
  const handleinput2Change = useCallback((value) => setInput2(value), []);
  const handleendYearChange = useCallback((value) => setEndYear(value), []);
  const handleendMonthChange = useCallback((value) => setEndMonth(value), []);

  return (
    <Page>
    <Layout>
    <Layout.Section>
      <Layout>
        <Layout.Section>
          <Card>
            <VerticalStack gap="3">
              <Text as="p" variant="bodyMd">
                Welcome to Breakdown Analyser! Go-to tool for gaining valuable insights into your Shopify store.
                With our app, you can easily analyze your order data, track customer journeys,
                and get a breakdown of order statistics. Take control of your e-commerce business like never before.
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
                    Year Input Format : (YYYY) [ex : 2023]
                </List.Item>
                <List.Item>
                    Month Input Format : (MM) [ex : 09]
                </List.Item>
              </List>
            </VerticalStack>
          </Card>
        </Layout.Section>
      </Layout>
      </Layout.Section>
      <Layout.Section>
    <Card>
    <div style={{ marginBottom : '50px' }}>
        <b> Note : Enter The Date Within Which You Want To Get Visits To Orders Analysis </b>
        <div style={{ marginTop : '20px' }}>
        <p> Ex : If you want orders within the range <b>2023-08</b> and <b>2023-09</b>,<br /> Then you must enter the Date :
        <b>2023-08</b> as starting date and <b>2023-10</b> as ending date</p>
        </div>
        </div>
      <Form name="OrderBreakdown" onSubmit={handleSubmit}>
        <FormLayout>
          <FormLayout.Group >
          <Card>
          <div style={{ marginBottom : '20px' }}>
            <h6><b> Starting Date </b></h6>
            </div>
            <TextField
              value={input1}
              onChange={handleinput1Change}
              label="Starting Year (yyyy)"
              type="text"
              autoComplete="off"
            />
            <TextField
              value={input2}
              onChange={handleinput2Change}
              label="Starting Month (mm)"
              type="text"
              autoComplete="off"
            />
            </Card>
            <Card>
            <div style={{ marginBottom : '20px' }}>
            <h6><b> Ending Date </b></h6>
            </div>
            <TextField
              value={endYear}
              onChange={handleendYearChange}
              label="Ending Year (yyyy)"
              type="text"
              autoComplete="off"
            />
            <TextField
              value={endMonth}
              onChange={handleendMonthChange}
              label="Ending Month (mm)"
              type="text"
              autoComplete="off"
            />
            </Card>
          </FormLayout.Group>
          <Button submit>Submit</Button>
        </FormLayout>
      </Form>
      </Card>
      </Layout.Section>
    </Layout>
    </Page>
  );
}
