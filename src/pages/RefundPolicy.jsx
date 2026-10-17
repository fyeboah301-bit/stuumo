import LegalLayout, { LegalSection, LegalParagraph, LegalList } from '../components/LegalLayout'

export default function RefundPolicy() {
  return (
    <LegalLayout
      title="Refund Policy"
      subtitle="When you can get your money back, how refunds work, and what to do if something goes wrong with a session."
      lastUpdated="October 10, 2026"
      metaTitle="Refund Policy"
    >
      <LegalParagraph>
        This Refund Policy explains when and how Stuumo handles refunds for sessions booked through the
        Platform. It forms part of our Terms of Service. We want every session to be worth it — and when it
        isn’t, this policy tells you where you stand.
      </LegalParagraph>

      <LegalSection heading="1. Learner cancellations">
        <LegalList items={[
          'Cancel at least 24 hours before the session start time: you receive a full refund.',
          'Cancel less than 24 hours before the session start time: the session may be non-refundable, because the Teacher has reserved the time. We may offer a credit at our discretion.',
          'No-show by the learner: the session is treated as delivered and is non-refundable.',
        ]} />
        <LegalParagraph>
          [Adjust these windows to the policy you want to run — e.g. 12h, 24h, or 48h — and confirm whether
          late cancellations give a credit or nothing.]
        </LegalParagraph>
      </LegalSection>

      <LegalSection heading="2. Teacher cancellations and no-shows">
        <LegalParagraph>
          If a Teacher cancels, fails to show up, or ends a session early without good reason, you are
          entitled to a full refund of that session, or the option to reschedule at no extra cost. Repeated
          cancellations by a Teacher may affect their standing on the Platform.
        </LegalParagraph>
      </LegalSection>

      <LegalSection heading="3. Technical problems">
        <LegalParagraph>
          If a session cannot take place or is seriously disrupted because of a technical failure on our side
          or the video service, we will offer a full refund or a free reschedule. Problems caused solely by a
          user’s own device or internet connection are not grounds for a refund, though we will help where we
          reasonably can.
        </LegalParagraph>
      </LegalSection>

      <LegalSection heading="4. Quality concerns">
        <LegalParagraph>
          If a session falls seriously short of what was promised, contact us within 48 hours of the session
          with details. We review quality complaints case by case and may issue a full or partial refund, or
          a credit, at our discretion.
        </LegalParagraph>
      </LegalSection>

      <LegalSection heading="5. How refunds are issued">
        <LegalList items={[
          'Approved refunds are returned to your original payment method through our payment processor.',
          'Refunds typically appear within 5–10 business days, depending on your bank or card provider.',
          'Refunds are made in the currency of the original payment. Any currency-conversion differences or bank fees are outside our control.',
          'A refund reverses the corresponding Teacher payout for that session.',
        ]} />
      </LegalSection>

      <LegalSection heading="6. Service fees">
        <LegalParagraph>
          Where a full refund is due (for example, a Teacher cancellation or a technical failure on our
          side), the full amount you paid — including the Stuumo service fee — is refunded. For partial or
          discretionary refunds, we will tell you what portion of the service fee, if any, is included.
        </LegalParagraph>
      </LegalSection>

      <LegalSection heading="7. How to request a refund">
        <LegalParagraph>
          Request a refund from your bookings dashboard, or email us at{' '}
          support@teachme.com with your booking reference and a short description of the issue. We aim to
          respond within a few business days.
        </LegalParagraph>
      </LegalSection>

      <LegalSection heading="8. Chargebacks">
        <LegalParagraph>
          Please contact us before initiating a chargeback with your bank — most issues are faster to resolve
          directly. Abusive or fraudulent chargebacks may result in account suspension.
        </LegalParagraph>
      </LegalSection>
    </LegalLayout>
  )
}
