# backend/utils/sql_helpers.py
"""
SQL Utility Helper Module
Provides reusable SQL execution patterns with proper error handling,
connection management, and SQL injection protection.
"""

from django.db import connection, transaction
from typing import List, Dict, Any, Optional, Tuple
from contextlib import contextmanager
import logging

logger = logging.getLogger(__name__)


def dictfetchall(cursor) -> List[Dict[str, Any]]:
    """
    Return all rows from a cursor as a list of dictionaries.
    
    Args:
        cursor: Database cursor object
        
    Returns:
        List of dictionaries with column names as keys
    """
    if cursor.description is None:
        return []
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def dictfetchone(cursor) -> Optional[Dict[str, Any]]:
    """
    Return one row from a cursor as a dictionary.
    
    Args:
        cursor: Database cursor object
        
    Returns:
        Dictionary with column names as keys, or None if no row found
    """
    row = cursor.fetchone()
    if row is None:
        return None
    columns = [col[0] for col in cursor.description]
    return dict(zip(columns, row))


@contextmanager
def get_cursor():
    """
    Context manager for database cursor with automatic cleanup.
    
    Usage:
        with get_cursor() as cursor:
            cursor.execute("SELECT * FROM table WHERE id = %s", [id])
            result = dictfetchall(cursor)
    """
    cursor = connection.cursor()
    try:
        yield cursor
    finally:
        cursor.close()


def execute_query(sql: str, params: Optional[List[Any]] = None, fetch: str = 'all') -> Any:
    """
    Execute a SELECT query and return results.
    
    Args:
        sql: SQL query string with %s placeholders
        params: List of parameters for the query
        fetch: 'all', 'one', or 'none'
        
    Returns:
        List of dicts, single dict, or None depending on fetch parameter
        
    Raises:
        DatabaseError: If query execution fails
    """
    params = params or []
    
    try:
        with get_cursor() as cursor:
            cursor.execute(sql, params)
            
            if fetch == 'all':
                return dictfetchall(cursor)
            elif fetch == 'one':
                return dictfetchone(cursor)
            elif fetch == 'none':
                return None
            else:
                raise ValueError(f"Invalid fetch parameter: {fetch}")
                
    except Exception as e:
        logger.error(f"Query execution failed: {sql[:100]}... Error: {str(e)}")
        raise


def execute_insert(sql: str, params: Optional[List[Any]] = None, return_id: bool = True) -> Optional[int]:
    """
    Execute an INSERT query and optionally return the new ID.
    
    Args:
        sql: SQL INSERT statement with %s placeholders
        params: List of parameters for the query
        return_id: Whether to return the inserted row's ID
        
    Returns:
        The ID of the inserted row if return_id=True, else None
        
    Raises:
        DatabaseError: If insert fails
    """
    params = params or []
    
    try:
        with get_cursor() as cursor:
            if return_id:
                # Append RETURNING id to the query
                if 'RETURNING' not in sql.upper():
                    sql += ' RETURNING id'
                cursor.execute(sql, params)
                result = cursor.fetchone()
                return result[0] if result else None
            else:
                cursor.execute(sql, params)
                return None
                
    except Exception as e:
        logger.error(f"Insert failed: {sql[:100]}... Error: {str(e)}")
        raise


def execute_update(sql: str, params: Optional[List[Any]] = None) -> int:
    """
    Execute an UPDATE query and return number of affected rows.
    
    Args:
        sql: SQL UPDATE statement with %s placeholders
        params: List of parameters for the query
        
    Returns:
        Number of rows affected
        
    Raises:
        DatabaseError: If update fails
    """
    params = params or []
    
    try:
        with get_cursor() as cursor:
            cursor.execute(sql, params)
            return cursor.rowcount
                
    except Exception as e:
        logger.error(f"Update failed: {sql[:100]}... Error: {str(e)}")
        raise


def execute_delete(sql: str, params: Optional[List[Any]] = None) -> int:
    """
    Execute a DELETE query and return number of affected rows.
    
    Args:
        sql: SQL DELETE statement with %s placeholders
        params: List of parameters for the query
        
    Returns:
        Number of rows deleted
        
    Raises:
        DatabaseError: If delete fails
    """
    params = params or []
    
    try:
        with get_cursor() as cursor:
            cursor.execute(sql, params)
            return cursor.rowcount
                
    except Exception as e:
        logger.error(f"Delete failed: {sql[:100]}... Error: {str(e)}")
        raise


def execute_bulk_insert(table: str, columns: List[str], values: List[Tuple]) -> int:
    """
    Execute a bulk INSERT operation.
    
    Args:
        table: Table name
        columns: List of column names
        values: List of tuples containing values
        
    Returns:
        Number of rows inserted
        
    Raises:
        DatabaseError: If bulk insert fails
    """
    if not values:
        return 0
        
    try:
        placeholders = ', '.join(['%s'] * len(columns))
        columns_str = ', '.join(columns)
        
        sql = f"INSERT INTO {table} ({columns_str}) VALUES ({placeholders})"
        
        with get_cursor() as cursor:
            cursor.executemany(sql, values)
            return cursor.rowcount
                
    except Exception as e:
        logger.error(f"Bulk insert failed for table {table}. Error: {str(e)}")
        raise


@transaction.atomic
def execute_transaction(operations: List[Tuple[str, List[Any]]]) -> bool:
    """
    Execute multiple SQL operations in a single transaction.
    
    Args:
        operations: List of tuples (sql, params)
        
    Returns:
        True if all operations succeed
        
    Raises:
        DatabaseError: If any operation fails (rolls back all)
        
    Usage:
        operations = [
            ("INSERT INTO table1 (col) VALUES (%s)", [val1]),
            ("UPDATE table2 SET col = %s WHERE id = %s", [val2, id]),
        ]
        execute_transaction(operations)
    """
    try:
        with get_cursor() as cursor:
            for sql, params in operations:
                cursor.execute(sql, params)
        return True
                
    except Exception as e:
        logger.error(f"Transaction failed. Error: {str(e)}")
        raise


def check_exists(table: str, conditions: Dict[str, Any]) -> bool:
    """
    Check if a record exists in a table.
    
    Args:
        table: Table name
        conditions: Dictionary of column: value pairs for WHERE clause
        
    Returns:
        True if record exists, False otherwise
        
    Usage:
        exists = check_exists('users_user', {'email': 'test@example.com'})
    """
    where_parts = []
    params = []
    
    for col, val in conditions.items():
        where_parts.append(f"{col} = %s")
        params.append(val)
    
    where_clause = ' AND '.join(where_parts)
    sql = f"SELECT EXISTS(SELECT 1 FROM {table} WHERE {where_clause})"
    
    try:
        with get_cursor() as cursor:
            cursor.execute(sql, params)
            return cursor.fetchone()[0]
                
    except Exception as e:
        logger.error(f"Exists check failed for {table}. Error: {str(e)}")
        raise


def get_by_id(table: str, id_value: int, id_column: str = 'id') -> Optional[Dict[str, Any]]:
    """
    Get a single record by ID.
    
    Args:
        table: Table name
        id_value: Value of the ID
        id_column: Name of the ID column (default: 'id')
        
    Returns:
        Dictionary of the row, or None if not found
    """
    sql = f"SELECT * FROM {table} WHERE {id_column} = %s"
    return execute_query(sql, [id_value], fetch='one')


def count_records(table: str, conditions: Optional[Dict[str, Any]] = None) -> int:
    """
    Count records in a table with optional conditions.
    
    Args:
        table: Table name
        conditions: Optional dictionary of column: value pairs for WHERE clause
        
    Returns:
        Number of records
    """
    sql = f"SELECT COUNT(*) FROM {table}"
    params = []
    
    if conditions:
        where_parts = []
        for col, val in conditions.items():
            where_parts.append(f"{col} = %s")
            params.append(val)
        sql += " WHERE " + ' AND '.join(where_parts)
    
    try:
        with get_cursor() as cursor:
            cursor.execute(sql, params)
            return cursor.fetchone()[0]
                
    except Exception as e:
        logger.error(f"Count failed for {table}. Error: {str(e)}")
        raise


class SQLBuilder:
    """
    Simple SQL query builder for common operations.
    """
    
    def __init__(self, table: str):
        self.table = table
        self.select_cols = ['*']
        self.where_conditions = []
        self.where_params = []
        self.order_by_clause = None
        self.limit_val = None
        self.offset_val = None
        
    def select(self, *columns):
        """Set columns to select"""
        self.select_cols = list(columns) if columns else ['*']
        return self
        
    def where(self, condition: str, *params):
        """Add WHERE condition"""
        self.where_conditions.append(condition)
        self.where_params.extend(params)
        return self
        
    def order_by(self, column: str, direction: str = 'ASC'):
        """Set ORDER BY clause"""
        self.order_by_clause = f"{column} {direction}"
        return self
        
    def limit(self, limit: int):
        """Set LIMIT"""
        self.limit_val = limit
        return self
        
    def offset(self, offset: int):
        """Set OFFSET"""
        self.offset_val = offset
        return self
        
    def build(self) -> Tuple[str, List[Any]]:
        """Build the SQL query"""
        cols = ', '.join(self.select_cols)
        sql = f"SELECT {cols} FROM {self.table}"
        
        if self.where_conditions:
            sql += " WHERE " + ' AND '.join(self.where_conditions)
            
        if self.order_by_clause:
            sql += f" ORDER BY {self.order_by_clause}"
            
        if self.limit_val:
            sql += f" LIMIT {self.limit_val}"
            
        if self.offset_val:
            sql += f" OFFSET {self.offset_val}"
            
        return sql, self.where_params
        
    def execute(self, fetch: str = 'all'):
        """Build and execute the query"""
        sql, params = self.build()
        return execute_query(sql, params, fetch=fetch)