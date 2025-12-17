import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const {
    name,
    slug,
    description,
    price,
    category_id,
    featured,
    status,
    file_key,
    tags = []
  } = req.body;

  try {
    // INSERT PRODUCT
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        slug,
        description,
        price,
        category_id,
        featured,
        status,
        file_key,
        active: true,
      })
      .select()
      .single();

    if (productError) throw productError;

    // INSERT TAGS + PRODUCT_TAGS
    for (const tag of tags) {
      const tagSlug = tag.toLowerCase().trim();

      // Does tag exist?
      const { data: existingTag } = await supabaseAdmin
        .from('tags')
        .select('*')
        .eq('slug', tagSlug)
        .maybeSingle();

      let tagId;

      if (existingTag) {
        tagId = existingTag.id;
      } else {
        // Create tag
        const { data: newTag, error: newTagError } = await supabaseAdmin
          .from('tags')
          .insert({ name: tagSlug, slug: tagSlug })
          .select()
          .single();

        if (newTagError) throw newTagError;
        tagId = newTag.id;
      }

      // Link product → tag
      await supabaseAdmin.from('product_tags').insert({
        product_id: product.id,
        tag_id: tagId,
      });
    }

    return res.status(200).json({ product });
  } catch (err) {
    console.error('API ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
}
