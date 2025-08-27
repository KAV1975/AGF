import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import os

def get_key_rate():
    url = 'https://cbr.ru/hd_base/keyrate/'
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        table = soup.find('table', {'class': 'data'})
        
        if not table:
            print("Не удалось найти таблицу с ставками.")
            return None
            
        rows = table.find_all('tr')
        if len(rows) < 2:
            print("В таблице нет данных.")
            return None
            
        latest_row = rows[1] # Самая актуальная ставка
        cells = latest_row.find_all('td')
        
        if len(cells) < 2:
            print("Недостаточно ячеек в строке.")
            return None
            
        date_str = cells[0].get_text(strip=True)
        rate_str = cells[1].get_text(strip=True)
        
        # Парсим дату и значение
        date_obj = datetime.strptime(date_str, '%d.%m.%Y')
        formatted_date = date_obj.strftime('%Y-%m-%d')
        rate_value = float(rate_str.replace(',', '.'))
        
        return {
            "date": formatted_date,
            "value": rate_value,
            "updated_at": datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        }
        
    except Exception as e:
        print(f"Произошла ошибка: {e}")
        return None

# Основная логика
if __name__ == "__main__":
    key_rate_data = get_key_rate()
    
    # Создаем папку 'data', если её нет
    os.makedirs('data', exist_ok=True)
    
    if key_rate_data:
        # Сохраняем данные в файл внутри папки data
        file_path = 'data/key_rate.json'
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(key_rate_data, f, ensure_ascii=False, indent=2)
        print(f"Ключевая ставка успешно сохранена в {file_path}: {key_rate_data}")
    else:
        print("Не удалось получить ключевую ставку. Файл не будет обновлен.")
        # Можно выйти с ошибкой, чтобы Action пометился как failed
        # exit(1)
