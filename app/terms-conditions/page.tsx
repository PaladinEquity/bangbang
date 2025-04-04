'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';

export default function TermsConditions() {
  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-12 bg-white shadow-md rounded-lg">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">Terms & Conditions</h1>

        <div className="prose prose-lg max-w-none divide-y divide-gray-200 text-gray-700">
          <p className="mb-6 text-gray-500 text-sm font-medium">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="py-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Terms & Conditions</h2>
            <p className="mt-2">This website is operated by Killer Walls ("Killer Walls"). Throughout the site, the terms "we", "us" and "our" refer to Killer Walls. Killer Walls offers this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.
            </p>
            <p className="mt-3">By visiting our site and/or purchasing something from us, you engage in our “Service” and agree to be bound by the following terms and conditions (“Terms of Service”, “Terms”), including those additional terms and conditions and policies referenced herein and/or available by hyperlink.
            </p>
            <p className="mt-3">These Terms of Service apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
            </p>
            <p className="mt-3">Please read these Terms of Service carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these Terms of Service.
            </p>
            <p className="mt-3">Any new features or tools which are added to the current store shall also be subject to the Terms of Service. You can review the most current version of the Terms of Service at any time on this page. We reserve the right to update, change or replace any part of these Terms of Service by posting updates and/or changes to our website. It is your responsibility to check this page periodically for changes. Your continued use of or access to the website following the posting of any changes constitutes acceptance of those changes
            </p>
          </div>

          <div className="py-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Online Store Terms</h2>
            <p className="mt-2">By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.</p>
            <p className="mt-3">You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).</p>
            <p className="mt-3">You must not transmit any worms or viruses or any code of a destructive nature.</p>
            <p className="mt-3">A breach or violation of any of the Terms will result in an immediate termination of your Services.</p>

          </div>

          <div className="py-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">General Conditions</h2>
            <p className="mt-2">We reserve the right to refuse service to anyone for any reason at any time.</p>
            <p className="mt-3">You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices. Credit card information is always encrypted during transfer over networks.</p>
            <p className="mt-3">You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service or any contact on the website through which the service is provided, without express written permission by us.</p>
            <p className="mt-3">The headings used in this agreement are included for convenience only and will not limit or otherwise affect these Terms.</p>
          </div>

          <div className="py-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Accuracy, completeness and timeliness of information</h2>
            <p className="mt-2">We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, more complete or more timely sources of information. Any reliance on the material on this site is at your own risk.</p>
            <p className="mt-3">This site may contain certain historical information. Historical information, necessarily, is not current and is provided for your reference only. We reserve the right to modify the contents of this site at any time, but we have no obligation to update any information on our site. You agree that it is your responsibility to monitor changes to our site.</p>
          </div>

          <div className="py-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Accuracy of Billing and Account Information</h2>
            <p className="mt-2">We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. These restrictions may include orders placed by or under the same customer account, the same credit card, and/or orders that use the same billing and/or shipping address. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the e-mail and/or billing address/phone number provided at the time the order was made. We reserve the right to limit or prohibit orders that, in our sole judgment, appear to be placed by dealers, resellers or distributors.</p>
            <p className="mt-3">You agree to provide current, complete and accurate purchase and account information for all purchases made at our store. You agree to promptly update your account and other information, including your email address and credit card numbers and expiration dates, so that we can complete your transactions and contact you as needed.</p>
            <p className="mt-3">For more detail, please review our Returns Policy.</p>
          </div>

          <div className="py-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Prohibited Uses</h2>
            <p className="mt-2">In addition to other prohibitions as set forth in the Terms of Service, you are prohibited from using the site or its content: (a) for any unlawful purpose; (b) to solicit others to perform or participate in any unlawful acts; (c) to violate any international, federal, provincial or state regulations, rules, laws, or local ordinances; (d) to infringe upon or violate our intellectual property rights or the intellectual property rights of others; (e) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability; (f) to submit false or misleading information; (g) to upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Service or of any related website, other websites, or the Internet; (h) to collect or track the personal information of others; (i) to spam, phish, pharm, pretext, spider, crawl, or scrape; (j) for any obscene or immoral purpose; or (k) to interfere with or circumvent the security features of the Service or any related website, other websites, or the Internet. We reserve the right to terminate your use of the Service or any related website for violating any of the prohibited uses.</p>
          </div>

          <div className="py-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Disclaimer of Warranties; Limitation of Liability</h2>
            <p className="mt-2">We do not guarantee, represent or warrant that your use of our service will be uninterrupted, timely, secure or error-free.</p>
            <p className="mt-3">We do not warrant that the results that may be obtained from the use of the service will be accurate or reliable.</p>
            <p className="mt-3">You agree that from time to time we may remove the service for indefinite periods of time or cancel the service at any time, without notice to you.</p>
            <p className="mt-3">You expressly agree that your use of, or inability to use, the service is at your sole risk. The service and all products and services delivered to you through the service are (except as expressly stated by us) provided 'as is' and 'as available' for your use, without any representation, warranties or conditions of any kind, either express or implied, including all implied warranties or conditions of merchantability, merchantable quality, fitness for a particular purpose, durability, title, and non-infringement.</p>
            <p className="mt-3">In no case shall Killer Walls, our directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind, including, without limitation lost profits, lost revenue, lost savings, loss of data, replacement costs, or any similar damages, whether based in contract, strict liability or otherwise, arising from your use of any of the service or any products procured using the service, or for any other claim related in any way to your use of the service or any product, including, but not limited to, any errors or omissions in any content, or any loss or damage of any kind incurred as a result of the use of the service or any content (or product) posted, transmitted, or otherwise made available via the service, even if advised of their possibility. Because some states or jurisdictions do not allow the exclusion or the limitation of liability for consequential or incidental damages, in such states or jurisdictions, our liability shall be limited to the maximum extent permitted by law.</p>
          </div>

          <div className="py-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Indemnification</h2>
            <p className="mt-2">You agree to indemnify, defend and hold harmless Killer Walls and our parent, subsidiaries, affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, interns and employees, harmless from any claim or demand, including reasonable attorneys' fees, made by any third-party due to or arising out of your breach of these Terms of Service or the documents they incorporate by reference, or your violation of any law or the rights of a third-party.</p>
          </div>

          <div className="py-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">9. Changes to Terms</h2>
            <p className="mt-2">We reserve the right to revise these terms and conditions at any time without notice. By using this website, you are agreeing to be bound by the current version of these terms and conditions.</p>
          </div>
        </div>
      </div>
    </>
  );
}