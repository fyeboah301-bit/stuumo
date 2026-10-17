import LegalLayout, { LegalSection, LegalParagraph, LegalList } from '../components/LegalLayout'

export default function Privacy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How Stuumo collects, uses, and protects your information — including information about children."
      lastUpdated="October 10, 2026"
      metaTitle="Privacy Policy"
    >
      <LegalParagraph>
        This Privacy Policy explains how Stuumo (“we”, “us”, or “our”) collects, uses, shares, and protects
        personal information when you use our website, applications, and services (the “Platform”). By using
        the Platform, you agree to the practices described here.
      </LegalParagraph>

      <LegalSection heading="1. Information we collect">
        <LegalList items={[
          'Account information: name, email address, phone number, city and country, role (learner, parent, or teacher), and a password.',
          'For teachers: professional details, qualifications, and the credential or identity documents you submit for verification, plus payout details.',
          'For parents and children: the parent’s account information, and the child’s name and the email used for the child’s account, which the parent provides when creating it.',
          'Booking and session information: sessions you request, confirm, attend, or cancel, messages related to a booking, and session feedback or progress notes.',
          'Payment information: processed by our third-party payment provider. We receive confirmation and limited transaction details but do not store full card numbers.',
          'Usage and device information: log data, approximate location derived from your network, and cookies or similar technologies used to operate and improve the Platform.',
        ]} />
      </LegalSection>

      <LegalSection heading="2. How we use information">
        <LegalList items={[
          'To create and manage accounts, including parent-managed child accounts.',
          'To enable discovery, booking, scheduling, payment, and video sessions.',
          'To verify teacher identity and credentials and to keep the Platform safe.',
          'To send transactional messages (booking confirmations, reminders, approval or rejection notices, and account notices).',
          'To provide support, prevent fraud and abuse, and comply with legal obligations.',
          'To understand and improve how the Platform is used.',
        ]} />
      </LegalSection>

      <LegalSection heading="3. Children’s information">
        <LegalParagraph>
          A parent or guardian creates and controls any child account. The parent provides the child’s
          information and is responsible for obtaining any consent required for that child to use the
          Platform. We use a child’s information only to provide the service (for example, to notify the
          child of a session a parent booked) and do not use it for advertising. A parent may access, correct,
          or request deletion of their child’s information by contacting us.
        </LegalParagraph>
      </LegalSection>

      <LegalSection heading="4. How we share information">
        <LegalList items={[
          'Between Learners and Teachers only as needed to arrange and hold a session. We do not reveal a learner’s or parent’s email or phone number to a teacher, or a teacher’s personal contact details to a learner or parent.',
          'With service providers that help us operate the Platform (payment processing, email delivery, video, and hosting), under obligations to protect the information.',
          'When required by law, to protect safety, or to enforce our Terms.',
          'In connection with a merger, acquisition, or sale of assets, subject to this Policy.',
        ]} />
        <LegalParagraph>We do not sell your personal information.</LegalParagraph>
      </LegalSection>

      <LegalSection heading="5. International transfers">
        <LegalParagraph>
          Stuumo operates worldwide. Your information may be processed in countries other than where you
          live. Where required, we take steps to ensure appropriate safeguards for cross-border transfers.
        </LegalParagraph>
      </LegalSection>

      <LegalSection heading="6. Data retention">
        <LegalParagraph>
          We keep personal information for as long as your account is active and as needed to provide the
          Platform, comply with legal, tax, and accounting obligations, resolve disputes, and enforce our
          agreements. When no longer needed, we delete or anonymize it.
        </LegalParagraph>
      </LegalSection>

      <LegalSection heading="7. Your rights and choices">
        <LegalList items={[
          'Access, correct, or update your account information from your dashboard.',
          'Request a copy or deletion of your personal information, subject to legal limits.',
          'Opt out of non-essential communications. Transactional messages are required to use the service.',
          'Manage cookies through your browser settings.',
        ]} />
        <LegalParagraph>
          Depending on where you live, you may have additional rights under local law. To exercise any right,
          contact us using the details below.
        </LegalParagraph>
      </LegalSection>

      <LegalSection heading="8. Security">
        <LegalParagraph>
          We use technical and organizational measures to protect personal information. No system is
          completely secure, so we cannot guarantee absolute security. Keep your credentials confidential and
          notify us of any suspected compromise.
        </LegalParagraph>
      </LegalSection>

      <LegalSection heading="9. Changes to this Policy">
        <LegalParagraph>
          We may update this Policy from time to time. If we make material changes, we will take reasonable
          steps to notify you. The “Last updated” date above reflects the latest version.
        </LegalParagraph>
      </LegalSection>
    </LegalLayout>
  )
}
