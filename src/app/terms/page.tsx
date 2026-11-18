import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Правила игры — КиберЩит: Беларусь" };

export default function Terms() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <article className="mx-auto max-w-3xl rounded-2xl border-4 border-black bg-white p-6 shadow-[8px_8px_0_#000] sm:p-10">
        <Link href="/" className="text-sm font-bold text-sky-700 underline">← Вернуться в игру</Link>
        <h1 className="mt-3 text-3xl font-black">📜 Правила игры</h1>

        <h2 className="mt-6 text-xl font-black">1. О проекте</h2>
        <p className="mt-2">«КиберЩит: Беларусь» — бесплатная образовательная игра о кибербезопасности. Все персонажи, организации и события вымышлены, любые совпадения случайны. Советы по безопасности основаны на реальных рекомендациях, но не заменяют консультацию специалиста. В реальной беде звоните <b>102</b>.</p>

        <h2 className="mt-6 text-xl font-black">2. Аккаунт</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          <li>Один человек — один аккаунт. Не передавайте пароль другим.</li>
          <li>Сохраните код восстановления: без него забытый пароль восстановить нельзя.</li>
          <li>Вы можете удалить аккаунт в любой момент в настройках.</li>
        </ul>

        <h2 className="mt-6 text-xl font-black">3. Запрещено</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          <li>Оскорбительные, нецензурные логины и имена, а также выдавать себя за администрацию или сотрудников МВД.</li>
          <li>Взламывать игру, подбирать чужие пароли, автоматически создавать аккаунты, накручивать рейтинг.</li>
          <li>Использовать знания из игры во вред: игра учит защищаться, а не нападать. Неправомерный доступ к компьютерной информации — преступление (ст. 349 УК РБ).</li>
        </ul>
        <p className="mt-2">За нарушения аккаунт может быть удалён, а имя скрыто из рейтинга.</p>

        <h2 className="mt-6 text-xl font-black">4. Ответственность</h2>
        <p className="mt-2">Игра предоставляется «как есть». Мы стараемся сохранять прогресс, но не гарантируем бесперебойную работу. Игровая валюта (BYN в игре) не имеет реальной стоимости.</p>

        <h2 className="mt-6 text-xl font-black">5. Данные</h2>
        <p className="mt-2">Как мы обращаемся с данными — в <Link href="/privacy" className="font-bold text-sky-700 underline">Политике конфиденциальности</Link>.</p>
      </article>
    </main>
  );
}
