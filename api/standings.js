
import * as cheerio from "cheerio";

export async function GET() {
    try {
        const response = await fetch(
            "https://www.bssl.com/scripts/tables.php?format=full&year=2026"
        );

        if (!response.ok) {
            return Response.json({
                error: "Could not retrieve BSSL standings",
                status: response.status
            }, { status: 502 });
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const standings = [];
        let division = "";

        $("tr").each((_, row) => {
            const header = $(row).find(".divisionHeader").first();

            if (header.length) {
                division = header.text().trim();
                return;
            }

            const values = $(row)
                .find("td")
                .map((_, cell) => $(cell).text().trim())
                .get();

            if (values.length < 10) return;

            const position = Number(values[0]);
            const played = Number(values[2]);

            if (
                !Number.isInteger(position) ||
                !Number.isInteger(played) ||
                !values[1]
            ) {
                return;
            }

            standings.push({
                division,
                position,
                team: values[1],
                played,
                wins: Number(values[3]),
                losses: Number(values[4]),
                draws: Number(values[5]),
                goalsFor: Number(values[6]),
                goalsAgainst: Number(values[7]),
                goalDifference: Number(values[8]),
                points: Number(values[9])
            });
        });

        return Response.json({ standings });

    } catch (error) {
        return Response.json({
            error: "Failed to process BSSL standings",
            details: error.message
        }, { status: 500 });
    }
}
