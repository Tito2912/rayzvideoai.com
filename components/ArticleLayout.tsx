import Link from 'next/link';
import { TableOfContents } from '@/components/TableOfContents';
import { FAQ } from '@/components/FAQ';
import { CTABox } from '@/components/CTABox';
import { UI_TRANSLATIONS, normalizeLang } from '@/lib/site';
import type { Post } from '@/lib/types';

export function ArticleLayout({ post }: { post: Post }) {
  const t = UI_TRANSLATIONS[normalizeLang(post.lang)];

  return (
    <article className="article stack">
      <div className="grid">
        <div className="stack">
          {post.quickAnswer?.length ? (
            <section className="card" aria-label={t.quickAnswer}>
              <strong>{t.quickAnswer}</strong>
              <ul className="list">
                {post.quickAnswer.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="stack">{post.content}</div>

          {post.cta ? (
            <CTABox title={post.cta.title} body={post.cta.body} buttonLabel={post.cta.buttonLabel} buttonHref={post.cta.buttonHref} />
          ) : null}

          {post.cta ? <hr className="hr" /> : null}

          {post.faq?.length ? <FAQ items={post.faq} /> : null}

          {post.internalLinks?.length ? (
            <section className="card">
              <h2 id="next-steps">{t.nextSteps}</h2>
              <ul className="list">
                {post.internalLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.anchor}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="toc" aria-label={t.onThisPage}>
          <div className="card">
            <strong>{t.onThisPage}</strong>
            <TableOfContents headings={post.headings} />
          </div>
        </aside>
      </div>
    </article>
  );
}
