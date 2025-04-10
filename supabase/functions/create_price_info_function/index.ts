
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

serve(async (req) => {
  // Create a Supabase client with the service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Create the SQL function to get products with price info
    const { error } = await supabase.rpc('exec_sql', {
      sql_statement: `
        CREATE OR REPLACE FUNCTION public.get_products_with_price_info()
        RETURNS TABLE(
          prodcode text,
          description text,
          unit text,
          current_price numeric,
          price_change numeric
        )
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RETURN QUERY
          WITH latest_prices AS (
            SELECT 
              ph.prodcode,
              ph.unitprice,
              ph.effdate
            FROM 
              pricehist ph
            INNER JOIN (
              SELECT 
                ph_inner.prodcode, 
                MAX(ph_inner.effdate) as max_date
              FROM 
                pricehist ph_inner
              GROUP BY 
                ph_inner.prodcode
            ) latest ON ph.prodcode = latest.prodcode AND ph.effdate = latest.max_date
          ),
          previous_prices AS (
            SELECT 
              ph.prodcode,
              ph.unitprice,
              ph.effdate
            FROM 
              pricehist ph
            INNER JOIN (
              SELECT 
                ph1.prodcode, 
                MAX(ph1.effdate) as prev_max_date
              FROM 
                pricehist ph1
              INNER JOIN (
                SELECT 
                  ph2.prodcode, 
                  MAX(ph2.effdate) as max_date
                FROM 
                  pricehist ph2
                GROUP BY 
                  ph2.prodcode
              ) latest ON ph1.prodcode = latest.prodcode AND ph1.effdate < latest.max_date
              GROUP BY 
                ph1.prodcode
            ) prev ON ph.prodcode = prev.prodcode AND ph.effdate = prev.prev_max_date
          )
          SELECT 
            p.prodcode,
            p.description,
            p.unit,
            COALESCE(lp.unitprice, NULL) as current_price,
            CASE 
              WHEN pp.unitprice IS NOT NULL AND pp.unitprice != 0 
              THEN ((lp.unitprice - pp.unitprice) / pp.unitprice) * 100 
              ELSE 0 
            END as price_change
          FROM 
            product p
          LEFT JOIN 
            latest_prices lp ON p.prodcode = lp.prodcode
          LEFT JOIN 
            previous_prices pp ON p.prodcode = pp.prodcode;
        END;
        $$;
      `
    });
    
    if (error) {
      throw error;
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Function created successfully" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating function:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});
