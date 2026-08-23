'use client';

import { Legal } from '@/components/legal/Legal';
import { DOC_PRIVACIDAD, DOC_TERMINOS } from '@/content/legal';
import '../landing.css';
import '../legal.css';

export default function TerminosPage() {
  return <Legal doc={DOC_TERMINOS} otro={DOC_PRIVACIDAD} />;
}
