import Airtable, { Table } from "airtable";
import { NextResponse } from "next/server";

var base = new Airtable({
  apiKey:
    "patqpqm8yUGAdhSoj.b42530f3bb52b3073c8a30eb1507a54227cb17fdc0d8ce0368ee61a8acf1c66d",
}).base("app1mph1VMncBBJid");


export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    
  try {
    const {id} = await params;
    const result = await new Promise<any[]>((resolve, reject) => {
      const results = base("السير الذاتية")
        .select({
          fields: ["fld1k07dcF6YGJK2Z", "fldKKxbf5nHUYaBuw"],
          filterByFormula: `And(REGEX_MATCH({fld1k07dcF6YGJK2Z},"${id}"))`,
          view: "الاساسي",
        })
        .all();

      resolve(results);
    });

    // console.log(/);
    // Send the filtered and paginated data as the response
      return NextResponse.json(
            {result: result[0].fields.Picture[0].url  },
            { status: 200 }
          );
       
    
    
  } catch (error) {
    console.error("Error fetching data:", error);

    return NextResponse.json(
        {error: "Error fetching data" },
        { status: 500 }
      );
   
  }
}
