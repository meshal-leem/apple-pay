import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import React, { useState, useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [apple, setApple] = useState(false);

  const constructPaymentRequest = () => {
    const paymentRequest = {
      countryCode: "AE",
      currencyCode: "AED",
      total: "23",
      merchantCapabilities: [
        "supports3DS",
      ],
      supportedNetworks: [
        "visa",
        "masterCard",
        "amex",
        "discover",
      ],
    };
    return {
      merchantId: "merchant.com.dev.leem",
      ApplePayPaymentRequest: paymentRequest,
    };
  };

  const startApplePaySession = () => {
    console.log("-----Apple pay clicked------");
    const { ApplePayPaymentRequest: request } = constructPaymentRequest();
    console.log("Request data created: ", request);
    const session = new ApplePaySession(getVersionNumber(), request);
    try {
      // Merhant validated
      session.onvalidatemerchant = (event) => {
        console.log("-------Event onvalidatemerchant--------");
        const { validationURL } = event;
        console.log("validationURL -", validationURL);
        paymentService.createApplePayMerhchantSession(validationURL).then((response) => {
          console.log("session created. Session data: ", response);
          if (response && response.success) {
            const { data } = response;
            if (data) {
              console.log("Calling completeMerchantValidation: ", data);
              session.completeMerchantValidation(data);
              console.log("-------Completed completeMerchantValidation call---------");
            } else {
              console.log("-------Failed completeMerchantValidation----------");
              session.completePayment(ApplePaySession.STATUS_FAILURE);
              setPaymentStatus("Failed");
            }
          } else if (response && response.errorCode === "CartError") {
            session.completePayment(ApplePaySession.STATUS_FAILURE);
            setPaymentStatus("Failed");
            router.push("/cart");
          } else {
            console.log("-------Failed completeMerchantValidation----------");
            session.completePayment(ApplePaySession.STATUS_FAILURE);
            setPaymentStatus("Failed");
          }
        });
      };

      session.onshippingcontactselected = function onshippingcontactselected(event) {
        console.log("-------Inside onshippingcontactselected()-------", event);
        // session.completeShippingContactSelection(update);
      };

      session.onshippingmethodselected = function onshippingmethodselected(event) {
        console.log("Inside onshippingmethodselected()", event);
        // session.completeShippingMethodSelection(update);
      };

      session.onpaymentmethodselected = function onpaymentmethodselected(event) {
        const update = {
          newTotal: request.total,
        };
        session.completePaymentMethodSelection(update);
        console.log("--------Inside onpaymentmethodselected()---------", event);
      };

      session.oncancel = function oncancel(event) {
        console.log("--------Inside oncancel()---------");
        console.log("\nPayment cancelled by WebKit: ", event);
      };

      // Payment authorized
      session.onpaymentauthorized = (event) => {
        console.log("------Event onpaymentauthorized-----------");
        const { payment: { token: { paymentData } } } = event;
        const encryptedData = btoa(JSON.stringify(paymentData));
        console.log("payment data: ", paymentData);
        console.log("encryptedData: ", encryptedData);
        paymentService.recordApplePayPayment(encryptedData).then((response) => {
          console.log("After cybersource call : ", response);
          if (response && response.success) {
            const { data } = response;
            if (data && data.success && data.status === "Accepted") {
              session.completePayment(ApplePaySession.STATUS_SUCCESS);
              // Redirecting to order confirmation page
              router.push({
                pathname: "/order-confirmation",
                query: { oid: data.orderId },
              });
            } else {
              session.completePayment(ApplePaySession.STATUS_FAILURE);
              setPaymentStatus("Declined");
            }
          } else {
            session.completePayment(ApplePaySession.STATUS_FAILURE);
            setPaymentStatus("Failed");
          }
        });
      };
    } catch (err) {
      console.log("Error occurred during apple payment - ", err);
      setPaymentStatus("Failed");
    }
    console.log("Starting apple pay session");
    session.begin();
  };

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    if (window.ApplePaySession) {
      var merchantIdentifier = 'merchant.com.dev.leem';
      var promise = ApplePaySession.canMakePaymentsWithActiveCard(merchantIdentifier);
      promise.then(function (canMakePayments) {
        if (canMakePayments) {
          setApple(true)
        }

      });
    }
  });
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <script src="https://applepay.cdn-apple.com/jsapi/v1/apple-pay-sdk.js"></script>


      </Head>
      <main className={styles.main}>
        {
          apple && (
            <button onClick={() => startApplePaySession()} >Hello</button>
          )
        }

      </main>
    </>
  )
}
