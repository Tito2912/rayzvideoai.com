import Link from 'next/link';
import { TableOfContents } from '@/components/TableOfContents';
import { FAQ } from '@/components/FAQ';
import { CTABox } from '@/components/CTABox';
import type { Post } from '@/lib/types';

export function ArticleLayout({ post }: { post: Post }) {
  return (
    <article className="article stack">
      <div className="grid">
        <div className="stack">
          {/* Quick answer block: visible fast */}
          {post.quickAnswer?.length ? (
            <section className="card" aria-label="Quick answer">
              <strong>Quick answer</strong>
              <ul className="list">
                {post.quickAnswer.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* MDX content */}
          <div className="stack">{post.content}</div>

          {/* CTA */}
          {post.cta ? (
            <CTABox title={post.cta.title} body={post.cta.body} buttonLabel={post.cta.buttonLabel} buttonHref={post.cta.buttonHref} />
          ) : null}

          {post.cta ? <hr className="hr" /> : null}

          {/* FAQ */}
          {post.faq?.length ? <FAQ items={post.faq} /> : null}

          {/* Next steps */}
          {post.internalLinks?.length ? (
            <section className="card">
              <h2 id="next-steps">Next steps</h2>
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

        <aside className="toc" aria-label="Table of contents">
          <div className="card">
            <strong>On this page</strong>
            <TableOfContents headings={post.headings} />
          </div>
        </aside>
      </div>
    </article>
  );
}
