'use client';

import { Legal } from '@/components/legal/Legal';
import { DOC_PRIVACIDAD, DOC_TERMINOS } from '@/content/legal';
import '../landing.css';
import '../legal.css';

export default function PrivacidadPage() {
  return <Legal doc={DOC_PRIVACIDAD} otro={DOC_TERMINOS} />;
}
