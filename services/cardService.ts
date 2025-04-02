import { db } from "../db";
import { drawnCardsTable, usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { geminiService } from "./geminiService";

export class CardService {
  // Karte deuten
  async interpretCard(cardName: string, userGoals: string = ""): Promise<string> {
    const cardReadingPrompt = "Deute die Karte im Kontext der aktuellen Situation.";
    
    const prompt = `Du legst Tarot Karten für Menschen. Erkläre und deute prägnant die soeben gelegte Karte "${cardName}" ohne Sonderzeichen. ${
      userGoals ? `Berücksichtige bei der Deutung folgende Ziele des Users: ${userGoals}.` : ""
    } ${cardReadingPrompt}`;

    return await geminiService.generateContent(prompt);
  }

  // Kartensatz interpretieren (z.B. 3er-Legung)
  async interpretCardSet(cardNames: string[], personalContext: string = ""): Promise<string> {
    if (!cardNames || cardNames.length < 3) {
      throw new Error("Mindestens drei Karten werden für eine Interpretation benötigt");
    }

    const [firstCard, secondCard, thirdCard] = cardNames;
    
    const prompt = `Du bist ein erfahrener Tarot-Kartenleser. 
    ${personalContext ? `Hier sind Informationen über die Person, für die du liest: ${personalContext}` : ''}
    Gib eine zusammenhängende, persönliche Interpretation der folgenden drei Tarotkarten:
    ${firstCard} repräsentiert die jetzige persönliche Lage (Gegenwart),
    ${secondCard} ein mögliches Problem (Konflikt) und
    ${thirdCard} ein Lösungsansatz oder Weisung (Perspektive).
    Die Interpretation soll motivierend und aufschlussreich sein.`;

    return await geminiService.generateContent(prompt);
  }

  // Benutzerkontext für Karteninterpretation erstellen
  async buildPersonalContextForUser(userId: number): Promise<{
    context: string;
    profileInfo: {
      goals: boolean;
      gender: boolean;
      zodiac: boolean;
      age: boolean;
    };
  }> {
    // Standardwerte
    let userGoals = "";
    let userGender = "";
    let userZodiacSign = "";
    let userAge = null;
    let personalContext = "";
    
    try {
      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);
        
      if (user.length > 0) {
        // Profildaten extrahieren
        userGoals = user[0].goals || "";
        userGender = user[0].gender || "";
        userZodiacSign = user[0].zodiacSign || "";
        
        // Alter berechnen, falls Geburtstag verfügbar
        if (user[0].birthday) {
          const birthDate = new Date(user[0].birthday);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          userAge = age;
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
    
    // Persönlichen Kontext aufbauen
    if (userGoals) personalContext += `Ziele der Person: ${userGoals}. `;
    if (userGender) {
      const genderText = userGender === 'm' ? 'männlich' : 
                        userGender === 'w' ? 'weiblich' : 'divers';
      personalContext += `Geschlecht: ${genderText}. `;
    }
    if (userZodiacSign) personalContext += `Sternzeichen: ${userZodiacSign}. `;
    if (userAge) personalContext += `Alter: ${userAge} Jahre. `;
    
    return {
      context: personalContext,
      profileInfo: {
        goals: !!userGoals,
        gender: !!userGender,
        zodiac: !!userZodiacSign,
        age: userAge !== null
      }
    };
  }
  
  // Karte in der Datenbank speichern
  async saveCard(userId: number, name: string, description: string, position: number | null = null, sessionId: string | null = null) {
    const actualSessionId = sessionId || `session_${Date.now()}`;
    
    return await db.insert(drawnCardsTable).values({
      name,
      description,
      userId,
      position,
      sessionId: actualSessionId,
      createdAt: new Date()
    }).returning();
  }

  // Zusammenfassung in der Datenbank speichern
  async saveReadingSummary(userId: number, sessionId: string, summary: string) {
    return await db.insert(drawnCardsTable).values({
      name: "Reading Summary",
      description: summary,
      userId,
      sessionId,
      position: 999, // Spezielle Position für Zusammenfassungen
      createdAt: new Date()
    }).returning();
  }
}

// Exportiere eine Singleton-Instanz
export const cardService = new CardService();