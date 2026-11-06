import { TestBed } from '@angular/core/testing';
import { LocalizedText, Product } from '../models/content.models';
import { ContentData, ContentService, DEFAULT_CONTENT } from './content.service';

/** Deep copy so each test can edit the content freely. */
function cloneContent(): ContentData {
  return structuredClone(DEFAULT_CONTENT);
}

function collectTexts(value: unknown, path: string, out: { path: string; text: LocalizedText }[]): void {
  if (Array.isArray(value)) {
    value.forEach((v, i) => collectTexts(v, `${path}[${i}]`, out));
  } else if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if ('en' in obj && 'es' in obj && Object.keys(obj).length === 2) {
      out.push({ path, text: obj as unknown as LocalizedText });
      return;
    }
    for (const [k, v] of Object.entries(obj)) collectTexts(v, `${path}.${k}`, out);
  }
}

describe('ContentService', () => {
  let content: ContentService;

  beforeEach(() => {
    content = TestBed.inject(ContentService);
    content.load(cloneContent());
  });

  describe('content files', () => {
    it('has every text in both English and Spanish', () => {
      const texts: { path: string; text: LocalizedText }[] = [];
      collectTexts(DEFAULT_CONTENT, 'content', texts);
      const missing = texts.filter((t) => !t.text.en.trim() || !t.text.es.trim()).map((t) => t.path);
      expect(texts.length).toBeGreaterThan(100);
      expect(missing).toEqual([]);
    });

    it('uses unique ids in every list', () => {
      const lists = ['products', 'services', 'faqs', 'testimonials', 'gallery'] as const;
      for (const list of lists) {
        const ids = DEFAULT_CONTENT[list].map((i) => i.id);
        expect(new Set(ids).size, list).toBe(ids.length);
      }
    });

    it('points every button to an existing section', () => {
      const sectionIds = new Set(DEFAULT_CONTENT.site.sections.map((s) => s.id));
      const targets: string[] = [];
      JSON.stringify(DEFAULT_CONTENT, (key, value) => {
        if (key === 'target') targets.push(value);
        return value;
      });
      expect(targets.length).toBeGreaterThan(0);
      expect(targets.filter((t) => !sectionIds.has(t as never))).toEqual([]);
    });

    it('links every testimonial and prefill to a real product or service', () => {
      const ids = new Set([...content.products(), ...content.services()].map((i) => i.id));
      for (const t of content.testimonials()) expect(ids.has(t.subject.id), t.id).toBe(true);
      for (const p of [...content.products(), ...content.services()]) {
        if (p.cta.prefill) expect(ids.has(p.cta.prefill), p.id).toBe(true);
      }
    });

    it('matches the approved content (5 products, 3 services, 8 FAQ, 3 reviews, 8 photos)', () => {
      expect(content.products().length).toBe(5);
      expect(content.services().length).toBe(3);
      expect(content.faqs().length).toBe(8);
      expect(content.testimonials().length).toBe(3);
      expect(content.gallery().length).toBe(8);
    });
  });

  describe('querying', () => {
    it('returns lists sorted by order', () => {
      const data = cloneContent();
      data.products[0].order = 99;
      content.load(data);
      expect(content.products().at(-1)?.id).toBe('hardwood');
    });

    it('finds products and services by id', () => {
      expect(content.product('tile')?.name.en).toBe('Tile');
      expect(content.service('refinishing')?.steps.length).toBe(3);
      expect(content.product('nope')).toBeUndefined();
    });

    it('builds quote form options from products then services', () => {
      const ids = content.quoteOptions().map((o) => `${o.kind}:${o.id}`);
      expect(ids[0]).toBe('product:hardwood');
      expect(ids.at(-1)).toBe('service:refinishing');
      expect(ids.length).toBe(8);
    });

    it('names what a testimonial is about', () => {
      const [sarah, , mariaTom] = content.testimonials();
      expect(content.subjectName(sarah)?.en).toBe('Hardwood');
      expect(content.subjectName(mariaTom)?.en).toBe('Repair & refinishing');
    });
  });

  describe('editing the data updates menus and page (card 14 "done" criterion)', () => {
    it('adds a new product everywhere it is listed', () => {
      const data = cloneContent();
      const stone: Product = {
        ...structuredClone(data.products[0]),
        id: 'stone',
        order: 6,
        name: { en: 'Natural stone', es: 'Piedra natural' },
      };
      data.products.push(stone);
      content.load(data);
      expect(content.products().map((p) => p.id)).toContain('stone');
      expect(content.quoteOptions().map((o) => o.id)).toContain('stone');
    });

    it('hides a record with visible: false without deleting it', () => {
      const data = cloneContent();
      data.faqs[0].visible = false;
      content.load(data);
      expect(content.faqs().length).toBe(7);
      expect(content.faqs().map((f) => f.id)).not.toContain('cost');
    });

    it('removes a section and its menu item when its list is empty', () => {
      const data = cloneContent();
      data.testimonials = [];
      content.load(data);
      expect(content.sections().map((s) => s.id)).not.toContain('reviews');
      expect(content.navItems().map((s) => s.id)).not.toContain('reviews');
    });

    it('hides a section from page and menu with visible: false', () => {
      const data = cloneContent();
      data.site.sections.find((s) => s.id === 'gallery')!.visible = false;
      content.load(data);
      expect(content.navItems().map((s) => s.id)).toEqual(['flooring', 'services', 'reviews', 'about', 'faq', 'contact']);
    });

    it('reorders the menu from the order field', () => {
      const data = cloneContent();
      data.site.sections.find((s) => s.id === 'faq')!.order = 2.5;
      content.load(data);
      expect(content.navItems()[1].id).toBe('faq');
    });
  });
});
