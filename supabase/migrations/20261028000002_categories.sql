create table public.categories (
  id smallint generated always as identity primary key,
  name text not null unique,
  slug text not null unique,
  description text,

  constraint slug_format check (slug ~ '^[a-z0-9-]+$')
);

alter table public.categories enable row level security;

-- Anyone can read categories. No other policies, so no one can write via the API.
create policy "Categories are viewable by everyone"
  on public.categories for select
  using (true);

-- Seed data
insert into public.categories (name, slug, description) values
  ('Web Development', 'web-development', 'HTML, CSS, JavaScript, frameworks and backend'),
  ('Graphic Design', 'graphic-design', 'Branding, layout, typography and illustration'),
  ('Networking', 'networking', 'Routing, switching, protocols and network setup'),
  ('Cybersecurity', 'cybersecurity', 'Ethical hacking, defense, and staying safe online'),
  ('Data Analysis', 'data-analysis', 'Excel, SQL, dashboards and turning data into insight'),
  ('Mobile Development', 'mobile-development', 'Android, iOS and cross-platform apps'),
  ('UI/UX Design', 'ui-ux-design', 'Research, wireframes, prototypes and usability'),
  ('Video Editing', 'video-editing', 'Editing, motion graphics and post-production'),
  ('Digital Marketing', 'digital-marketing', 'SEO, social media, ads and content strategy'),
  ('Cloud & DevOps', 'cloud-devops', 'Servers, deployment, CI/CD and containers'),
  ('Data Science & AI', 'data-science-ai', 'Python, machine learning and AI tools'),
  ('Writing', 'writing', 'Copywriting, blogging and technical writing'),
  ('Language Learning', 'language-learning', 'Learning and practicing new languages');