import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import React, { useState, useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [apple, setApple] = useState(false);

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
      </Head>
      <main className={styles.main}>
        {
          apple && (
            <button>hello</button>
          )
        }

      </main>
    </>
  )
}
