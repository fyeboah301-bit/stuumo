import LegalLayout, { LegalSection, LegalParagraph, LegalList } from '../components/LegalLayout'

export default function Terms() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="The rules for using Stuumo. By creating an account or booking a session, you agree to these terms."
      lastUpdated="October 10, 2026"
      metaTitle="Terms of Service"
    >
      <LegalParagraph>
        Welcome to Stuumo. These Terms of Service (the “Terms”) govern your access to and use of the
        Stuumo website, applications, and services (together, the “Platform”), operated by Stuumo
        (“Stuumo”, “we”, “us”, or “our”). Please read them carefully. If you do not agree, do not use the Platform.
      </LegalParagraph>

      <LegalSection heading="1. Who we are and what Stuumo does">
        <LegalParagraph>
          Stuumo is an online marketplace that connects independent tutors and teachers (“Teachers”) with
          learners, and with parents or guardians who book on behalf of a learner (together, “Learners”).
          Stuumo provides the technology to discover Teachers, schedule one-on-one and live group sessions,
          process payments, and hold sessions over video. Stuumo is not an employer of Teachers, does not
          supervise or direct the teaching, and does not guarantee any particular educational outcome.
        </LegalParagraph>
      </LegalSection>

      <LegalSection heading="2. Eligibility and accounts">
        <LegalList items={[
          'You must be able to form a legally binding contract to use the Platform. If you are below the age of majority in your location, a parent or guardian must create and manage your account.',
          'Parents and guardians may create and manage accounts for their children. You are responsible for all activity under any account you create or control, including child accounts you set up.',
          'You agree to provide accurate information, keep it up to date, and keep your login credentials secure. Notify us promptly of any unauthorized use of your account.',
          'Teachers must provide truthful information about their qualifications and may be asked to complete identity and credential checks before being approved to offer sessions.',
        ]} />
      </LegalSection>

      <LegalSection heading="3. Bookings, sessions, and scheduling">
        <LegalParagraph>
          Learners request sessions based on a Teacher’s stated availability. A booking is confirmed only
          once payment is completed and the Teacher accepts, where acceptance is required. Times are subject
          to each party’s time zone. You agree to attend booked sessions on time and to behave respectfully.
          Stuumo may reschedule, cancel, or decline bookings where necessary (for example, to prevent
          double-booking, fraud, or policy violations).
        </LegalParagraph>
      </LegalSection>

      <LegalSection heading="4. Payments, fees, and payouts">
        <LegalList items={[
          'Prices are set by Teachers and shown before you confirm a booking. Payment is collected at the time of booking through our third-party payment processor.',
          'Stuumo charges a service fee (commission) on each transaction. The fee is reflected in the amounts shown to Teachers and is deducted before payout.',
          'Teacher payouts are made to the payout details the Teacher provides, on the schedule described in the Platform, less applicable fees, refunds, and chargebacks.',
          'You are responsible for any taxes that apply to your use of the Platform or to income you earn through it.',
        ]} />
      </LegalSection>

      <LegalSection heading="5. Cancellations and refunds">
        <LegalParagraph>
          Cancellations and refunds are governed by our Refund Policy, which forms part of these Terms.
          Please review it before booking.
        </LegalParagraph>
      </LegalSection>

      <LegalSection heading="6. Conduct and prohibited use">
        <LegalParagraph>You agree not to:</LegalParagraph>
        <LegalList items={[
          'Use the Platform for anything unlawful, harmful, deceptive, or abusive.',
          'Circumvent Stuumo to arrange or pay for sessions off-platform in order to avoid fees, where the connection was made through Stuumo.',
          'Harass, threaten, discriminate against, or endanger any other user, and in particular any minor.',
          'Share false credentials, impersonate others, or misrepresent your identity or qualifications.',
          'Interfere with, scrape, or attempt to gain unauthorized access to the Platform or its systems.',
          'Record a session without the clear consent of all participants (and, for a minor, their parent or guardian).',
        ]} />
      </LegalSection>

      <LegalSection heading="7. Safety and minors">
        <LegalParagraph>
          The safety of young learners matters to us. Parents and guardians are responsible for supervising
          their children’s use of the Platform and sessions as appropriate. Teachers must keep all
          interactions professional and appropriate, must not seek to contact or isolate a minor outside the
          booked session, and must comply with all applicable child-protection laws. We may suspend or remove
          any account that raises safety concerns.
        </LegalParagraph>
      </LegalSection>

      <LegalSection heading="8. Content and intellectual property">
        <LegalParagraph>
          Teachers and Learners retain ownership of the materials they create and upload, but grant Stuumo a
          license to host and display that content as needed to operate the Platform. The Stuumo name, logo,
          and software are owned by Stuumo and may not be used without permission.
        </LegalParagraph>
      </LegalSection>

      <LegalSection heading="9. Disclaimers">
        <LegalParagraph>
          The Platform is provided “as is” and “as available.” Stuumo does not warrant that sessions will
          meet your expectations, that the Platform will be uninterrupted or error-free, or that any Teacher
          or Learner is suitable for you. Stuumo is a venue connecting independent users and is not
          responsible for the acts or omissions of Teachers or Learners.
        </LegalParagraph>
      </LegalSection>

      <LegalSection heading="10. Limitation of liability">
        <LegalParagraph>
          To the maximum extent permitted by law, Stuumo will not be liable for any indirect, incidental,
          special, or consequential damages, or for lost profits, arising out of or related to your use of
          the Platform. Our total liability for any claim will not exceed the amount of fees you paid to
          Stuumo in the three months before the event giving rise to the claim.
        </LegalParagraph>
      </LegalSection>

      <LegalSection heading="11. Suspension and termination">
        <LegalParagraph>
          You may stop using the Platform at any time. We may suspend or terminate your access if you breach
          these Terms, create risk for other users, or for legal or operational reasons. Amounts already
          earned or owed remain payable subject to the Refund Policy.
        </LegalParagraph>
      </LegalSection>

      <LegalSection heading="12. Changes to these Terms">
        <LegalParagraph>
          We may update these Terms from time to time. If we make material changes, we will take reasonable
          steps to notify you. Your continued use of the Platform after changes take effect means you accept
          the updated Terms.
        </LegalParagraph>
      </LegalSection>

      <LegalSection heading="13. Governing law">
        <LegalParagraph>
          These Terms are governed by the laws of the jurisdiction in which Stuumo is established, without
          regard to conflict-of-law rules. [Insert governing-law jurisdiction and dispute-resolution venue.]
        </LegalParagraph>
      </LegalSection>
    </LegalLayout>
  )
}
